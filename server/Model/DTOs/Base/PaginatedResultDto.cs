using System.Collections.Generic;

namespace Model.DTOs.Base
{
    /// <summary>
    /// Generic DTO for returning paginated results
    /// </summary>
    /// <typeparam name="T">The type of items in the result</typeparam>
    public class PaginatedResultDto<T>
    {
        /// <summary>
        /// The current page index (1-based)
        /// </summary>
        public int PageIndex { get; set; }

        /// <summary>
        /// Number of items per page
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Total number of items across all pages
        /// </summary>
        public int TotalCount { get; set; }

        /// <summary>
        /// Total number of pages
        /// </summary>
        public int TotalPages => (TotalCount + PageSize - 1) / PageSize;

        /// <summary>
        /// The items on the current page
        /// </summary>
        public IEnumerable<T> Items { get; set; }

        /// <summary>
        /// Creates a new PaginatedResultDto with the specified items and pagination information
        /// </summary>
        /// <param name="items">The items on the current page</param>
        /// <param name="totalCount">Total number of items across all pages</param>
        /// <param name="pageIndex">Current page index (1-based)</param>
        /// <param name="pageSize">Number of items per page</param>
        public PaginatedResultDto(IEnumerable<T> items, int totalCount, int pageIndex, int pageSize)
        {
            PageIndex = pageIndex;
            PageSize = pageSize;
            TotalCount = totalCount;
            Items = items;
        }

        /// <summary>
        /// Empty constructor for deserialization
        /// </summary>
        public PaginatedResultDto()
        {
            Items = new List<T>();
        }
    }
}