using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdersManagement.Backend.Models
{
    public class OrderAttribute
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string AttributeName { get; set; }
        
        [MaxLength(500)]
        public string AttributeValue { get; set; }
        
        [MaxLength(20)]
        public string AttributeType { get; set; } = "string"; // Może być: string, number, date, boolean
        
        // Navigation property
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
    }
}
