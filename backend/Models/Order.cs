using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OrdersManagement.Backend.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; }
        
        [Required]
        public DateTime OrderDate { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "New";
        
        [MaxLength(500)]
        public string Description { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Wewnętrzny status dla śledzenia procesów
        [MaxLength(50)]
        public string InternalStatus { get; set; }
        
        // Priorytet zamówienia (1-5)
        public int Priority { get; set; } = 3;
        
        // Planowana data realizacji
        public DateTime? TargetCompletionDate { get; set; }
        
        // Rzeczywista data realizacji
        public DateTime? ActualCompletionDate { get; set; }
        
        // Relacje
        
        // Atrybuty niestandardowe
        public virtual ICollection<OrderAttribute> Attributes { get; set; } = new List<OrderAttribute>();
        
        // Komentarze
        public virtual ICollection<OrderComment> Comments { get; set; } = new List<OrderComment>();
        
        // Historia zmian
        public virtual ICollection<OrderHistory> History { get; set; } = new List<OrderHistory>();
    }
}