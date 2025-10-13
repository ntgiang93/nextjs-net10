using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Model.Entities.System
{
    // Plan (pseudocode):
    // - Remove [Key] from BaseEntity<TKey>.EF Core will use 'Id' as PK by convention for most types.
    // - Add a string-specific base class BaseEntityString that hides 'Id' and marks it [NotMapped]
    //   so EF won't treat it as a key when TKey is string.
    // - For entities needing a different key when TKey is string, derive from BaseEntityString
    //   and configure the actual key via [Key] on another property or Fluent API in OnModelCreating.

    public interface IBaseEntity
    {
        [JsonIgnore]
        [Column(TypeName = "datetime2")]
        public DateTime CreatedAt { get; set; }

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
        public bool IsDeleted { get; set; }
    }

    public abstract class BaseEntity<TKey> : IBaseEntity
    {
        [Key]
        public virtual TKey Id { get; set; }

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
