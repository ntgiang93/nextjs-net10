using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Model.Entities.System
{
    public interface IBaseEntity
    {
        DateTime CreatedAt { get; set; }
        DateTime? UpdatedAt { get; set; }
        bool IsDeleted { get; set; }
    }
    public abstract class BaseEntity<TKey> : IBaseEntity
    {
        [Key]
        public TKey Id { get; set; }
        [JsonIgnore]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        [StringLength(30)]
        public string CreatedBy { get; set; }
        [JsonIgnore]
        [Column(TypeName = "datetime2")]
        public DateTime? UpdatedAt { get; set; }
        [JsonIgnore]
        [StringLength(30)]
        public string? UpdatedBy { get; set; }
        [JsonIgnore]
        public bool IsDeleted { get; set; } = false;
    }
}
