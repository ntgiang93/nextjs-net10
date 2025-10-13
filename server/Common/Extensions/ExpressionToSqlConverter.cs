using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace Common.Extensions
{
    /// <summary>
    /// Kết quả chuyển đổi một <see cref="Expression"/> (predicate) của LINQ thành mệnh đề WHERE của SQL.
    /// </summary>
    /// <remarks>
    /// <para>
    /// - <see cref="WhereClause"/> là đoạn SQL biểu diễn phần điều kiện WHERE (không bao gồm từ khóa "WHERE").
    /// - <see cref="Parameters"/> là tập tên tham số và giá trị đi kèm để truyền cho ADO/Dapper.
    ///   Các giá trị được tham số hóa để tránh SQL injection và cho phép DB cache kế hoạch thực thi.
    /// </para>
    /// </remarks>
    public class SqlQueryResult
    {
        /// <summary>
        /// Đoạn SQL WHERE sinh ra từ biểu thức predicate (ví dụ: "(UserName = @p0 AND IsActive = @p1)").
        /// </summary>
        public string WhereClause { get; set; } = string.Empty;

        /// <summary>
        /// Bản đồ tên tham số tới giá trị. Dùng với Dapper (hoặc ADO) để bind tham số.
        /// </summary>
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Chuyển đổi một biểu thức predicate LINQ kiểu mạnh thành mệnh đề WHERE SQL có tham số hóa.
    /// </summary>
    /// <typeparam name="TEntity">Kiểu thực thể được dùng trong predicate (ví dụ: User).</typeparam>
    /// <remarks>
    /// <para>
    /// Các nút biểu thức được hỗ trợ:
    /// - So sánh nhị phân: ==, !=, &gt;, &gt;=, &lt;, &lt;=
    /// - Tổ hợp logic: <see cref="ExpressionType.AndAlso"/> (AND), <see cref="ExpressionType.OrElse"/> (OR), NOT
    /// - Truy cập thuộc tính trên thực thể: ví dụ x =&gt; x.UserName, x =&gt; x.IsActive
    /// - Hằng số và biến đóng (closure) sẽ được trích giá trị và tham số hóa
    /// - Các phương thức: string.Contains, string.StartsWith, string.EndsWith, string.IsNullOrEmpty, và IEnumerable.Contains(value)
    /// </para>
    /// <para>
    /// Trình chuyển đổi này chỉ sinh phần WHERE. Cách chạy với Dapper:
    /// <code>
    /// var converter = new ExpressionToSqlConverter();
    /// var result = converter.Convert<User>(x => x.UserName == username && x.IsActive);
    /// var sql = $"SELECT * FROM Users WHERE {result.WhereClause}";
    /// var rows = await connection.QueryAsync<User>(sql, result.Parameters);
    /// </code>
    /// </para>
    /// <para>
    /// Ghi chú và giới hạn:
    /// - Tên cột mặc định dùng tên thuộc tính (xem <see cref="GetColumnName"/>). Nếu DB dùng tên khác hoặc quy ước khác,
    ///   hãy override <see cref="GetColumnName"/>.
    /// - Không hỗ trợ mặc định: thuộc tính dẫn hướng lồng nhau, lời gọi hàm phức tạp, hàm tự định nghĩa hoặc hàm đặc thù nhà cung cấp.
    /// - Lớp này không an toàn luồng do trạng thái tham số bên trong; nên khởi tạo theo lần dùng hoặc bảo vệ bên ngoài.
    /// </para>
    /// </remarks>
    public class ExpressionToSqlConverter
    {
        // Lưu bản đồ tên->giá trị cho tất cả tham số trong một lần chuyển đổi.
        private Dictionary<string, object> _parameters;

        // Bộ đếm tăng dần để đảm bảo tên tham số là duy nhất trong một lần chuyển đổi.
        private int _parameterCounter;

        /// <summary>
        /// Chuyển đổi predicate thành mệnh đề WHERE có tham số và tập tham số đi kèm.
        /// </summary>
        /// <param name="predicate">Biểu thức dạng <c>x =&gt; x.Email == email &amp;&amp; x.IsActive</c>.</param>
        /// <typeparam name="TEntity">Kiểu thực thể của tham số trong predicate.</typeparam>
        /// <returns><see cref="SqlQueryResult"/> chứa WHERE fragment và dictionary tham số.</returns>
        public SqlQueryResult Convert<TEntity>(Expression<Func<TEntity, bool>> predicate)
        {
            _parameters = new Dictionary<string, object>();
            _parameterCounter = 0;

            // Duyệt cây biểu thức và dựng SQL an toàn với tham số.
            var whereClause = VisitExpression(predicate.Body);

            return new SqlQueryResult
            {
                WhereClause = whereClause,
                Parameters = _parameters
            };
        }

        /// <summary>
        /// Phân phối xử lý theo loại nút biểu thức và trả về đoạn SQL tương ứng.
        /// </summary>
        /// <exception cref="NotSupportedException">Ném khi gặp loại nút chưa hỗ trợ.</exception>
        private string VisitExpression(Expression expression)
        {
            switch (expression.NodeType)
            {
                case ExpressionType.Lambda:
                    return VisitExpression(((LambdaExpression)expression).Body);

                case ExpressionType.AndAlso:
                    // Toán tử AND
                    var andLeft = VisitExpression(((BinaryExpression)expression).Left);
                    var andRight = VisitExpression(((BinaryExpression)expression).Right);
                    return $"({andLeft} AND {andRight})";

                case ExpressionType.OrElse:
                    // Toán tử OR
                    var orLeft = VisitExpression(((BinaryExpression)expression).Left);
                    var orRight = VisitExpression(((BinaryExpression)expression).Right);
                    return $"({orLeft} OR {orRight})";

                case ExpressionType.Equal:
                    return VisitBinaryExpression((BinaryExpression)expression, "=");

                case ExpressionType.NotEqual:
                    return VisitBinaryExpression((BinaryExpression)expression, "!=");

                case ExpressionType.GreaterThan:
                    return VisitBinaryExpression((BinaryExpression)expression, ">");

                case ExpressionType.GreaterThanOrEqual:
                    return VisitBinaryExpression((BinaryExpression)expression, ">=");

                case ExpressionType.LessThan:
                    return VisitBinaryExpression((BinaryExpression)expression, "<");

                case ExpressionType.LessThanOrEqual:
                    return VisitBinaryExpression((BinaryExpression)expression, "<=");

                case ExpressionType.Call:
                    // Xử lý các lời gọi phương thức được hỗ trợ như Contains/StartsWith/EndsWith/IsNullOrEmpty
                    return VisitMethodCall((MethodCallExpression)expression);

                case ExpressionType.Not:
                    // Phủ định (NOT)
                    var notExpression = VisitExpression(((UnaryExpression)expression).Operand);
                    return $"NOT ({notExpression})";

                case ExpressionType.MemberAccess:
                    return VisitMemberAccess((MemberExpression)expression);

                case ExpressionType.Constant:
                    return VisitConstant((ConstantExpression)expression);

                default:
                    throw new NotSupportedException($"Expression type {expression.NodeType} is not supported");
            }
        }

        /// <summary>
        /// Chuyển một biểu thức nhị phân thành SQL với toán tử truyền vào (ví dụ: "=" hoặc ">").
        /// </summary>
        private string VisitBinaryExpression(BinaryExpression expression, string operatorString)
        {
            var left = VisitExpression(expression.Left);
            var right = VisitExpression(expression.Right);

            return $"{left} {operatorString} {right}";
        }

        /// <summary>
        /// Chuyển các lời gọi phương thức được hỗ trợ thành các đoạn SQL.
        /// </summary>
        /// <remarks>
        /// - <c>string.Contains(value)</c> =&gt; <c>Column LIKE '%' + @p + '%'</c>
        /// - <c>string.StartsWith(value)</c> =&gt; <c>Column LIKE @p + '%'</c>
        /// - <c>string.EndsWith(value)</c> =&gt; <c>Column LIKE '%' + @p</c>
        /// - <c>string.IsNullOrEmpty(value)</c> =&gt; <c>(Column IS NULL OR Column = '')</c>
        /// - <c>Enumerable.Contains(list, x.Property)</c> =&gt; <c>Property IN (@p0, @p1, ...)</c>
        /// </remarks>
        private string VisitMethodCall(MethodCallExpression expression)
        {
            if (expression.Method.Name == "Contains")
            {
                if (expression.Object != null) // String.Contains
                {
                    var member = VisitExpression(expression.Object);
                    var value = GetExpressionValue(expression.Arguments[0]);
                    var paramName = AddParameter(value);
                    return $"{member} LIKE '%' + {paramName} + '%'";
                }
                else if (expression.Arguments.Count == 2) // List.Contains hoặc IEnumerable.Contains
                {
                    var collection = GetExpressionValue(expression.Arguments[0]);
                    var member = VisitExpression(expression.Arguments[1]);

                    if (collection is System.Collections.IEnumerable enumerable)
                    {
                        var values = new List<string>();
                        foreach (var item in enumerable)
                        {
                            values.Add(AddParameter(item));
                        }
                        return $"{member} IN ({string.Join(", ", values)})";
                    }
                }
            }
            else if (expression.Method.Name == "StartsWith")
            {
                var member = VisitExpression(expression.Object);
                var value = GetExpressionValue(expression.Arguments[0]);
                var paramName = AddParameter(value);
                return $"{member} LIKE {paramName} + '%'";
            }
            else if (expression.Method.Name == "EndsWith")
            {
                var member = VisitExpression(expression.Object);
                var value = GetExpressionValue(expression.Arguments[0]);
                var paramName = AddParameter(value);
                return $"{member} LIKE '%' + {paramName}";
            }
            else if (expression.Method.Name == "IsNullOrEmpty")
            {
                var member = VisitExpression(expression.Arguments[0]);
                return $"({member} IS NULL OR {member} = '')";
            }

            throw new NotSupportedException($"Method {expression.Method.Name} is not supported");
        }

        /// <summary>
        /// Xử lý truy cập thành viên. Nếu thành viên thuộc về tham số thực thể, coi như là tên cột.
        /// Ngược lại, sẽ đánh giá giá trị và tham số hóa.
        /// </summary>
        private string VisitMemberAccess(MemberExpression expression)
        {
            if (expression.Expression != null && expression.Expression.NodeType == ExpressionType.Parameter)
            {
                // Truy cập thuộc tính trên thực thể (ví dụ: x.Name) => tên cột
                return GetColumnName(expression.Member.Name);
            }
            else
            {
                // Giá trị trong closure hoặc hằng số => đánh giá và tham số hóa
                var value = GetExpressionValue(expression);
                return AddParameter(value);
            }
        }

        /// <summary>
        /// Tạo tham số cho một hằng số.
        /// </summary>
        private string VisitConstant(ConstantExpression expression)
        {
            return AddParameter(expression.Value);
        }

        /// <summary>
        /// Trích ra giá trị runtime từ một biểu thức bất kỳ không phải truy cập thuộc tính thực thể đơn giản.
        /// </summary>
        private object GetExpressionValue(Expression expression)
        {
            if (expression is ConstantExpression constant)
            {
                return constant.Value;
            }

            if (expression is MemberExpression memberExpression)
            {
                if (memberExpression.Expression is ConstantExpression constantExpression)
                {
                    var container = constantExpression.Value;
                    var member = memberExpression.Member;

                    if (member is FieldInfo field)
                        return field.GetValue(container);
                    if (member is PropertyInfo property)
                        return property.GetValue(container);
                }
            }

            // Phương án cuối: compile và thực thi biểu thức để lấy giá trị
            var lambda = Expression.Lambda(expression);
            var compiled = lambda.Compile();
            return compiled.DynamicInvoke();
        }

        /// <summary>
        /// Thêm một tham số được đặt tên tự động và trả về tên của nó (ví dụ: "@p0").
        /// </summary>
        private string AddParameter(object value)
        {
            var paramName = $"@p{_parameterCounter++}";
            _parameters[paramName] = value ?? DBNull.Value;
            return paramName;
        }

        /// <summary>
        /// Ánh xạ tên thuộc tính sang tên cột SQL. Override để áp dụng quy ước đặt tên riêng
        /// (ví dụ: snake_case) hoặc tra cứu từ điển ánh xạ.
        /// </summary>
        private string GetColumnName(string propertyName)
        {
            // Tùy biến phương thức này để xử lý ánh xạ tên cột nếu DB khác tên thuộc tính C#.
            // Ví dụ: chuyển PascalCase sang snake_case hoặc đọc từ attribute.
            return propertyName;
        }
    }
}
