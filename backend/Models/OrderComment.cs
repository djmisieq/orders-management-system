using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdersManagement.Backend.Models
{
    public class OrderComment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(1000)]
        public string Content { get; set; }
        
        // Użytkownik, który dodał komentarz
        public int UserId { get; set; }
        
        [MaxLength(100)]
        public string UserName { get; set; }
        
        // Data utworzenia komentarza
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Ścieżka do załącznika (jeśli istnieje)
        [MaxLength(255)]
        public string AttachmentPath { get; set; }
        
        // Typ załącznika, np. 'image/jpeg', 'application/pdf', itp.
        [MaxLength(100)]
        public string AttachmentType { get; set; }
        
        // Nazwa oryginalnego pliku
        [MaxLength(255)]
        public string AttachmentName { get; set; }
        
        // Relacja z zamówieniem
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
    }
}