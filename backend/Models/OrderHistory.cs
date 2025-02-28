using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace OrdersManagement.Backend.Models
{
    public class OrderHistory
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        // Typ zmiany: Create, Update, StatusChange, AttributeAdd, AttributeUpdate, AttributeDelete
        [Required]
        [MaxLength(50)]
        public string ChangeType { get; set; }
        
        // Opis zmiany w formacie czytelnym dla człowieka
        [Required]
        [MaxLength(500)]
        public string Description { get; set; }
        
        // Serializowane dane przed zmianą (JSON)
        public string OldValue { get; set; }
        
        // Serializowane dane po zmianie (JSON)
        public string NewValue { get; set; }
        
        // Użytkownik, który dokonał zmiany
        public int UserId { get; set; }
        
        [MaxLength(100)]
        public string UserName { get; set; }
        
        // Data dokonania zmiany
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        
        // Relacja z zamówieniem
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
        
        // Metody pomocnicze do obsługi zmian
        
        // Utwórz wpis historii dla nowego zamówienia
        public static OrderHistory ForCreation(Order order, int userId, string userName)
        {
            return new OrderHistory
            {
                OrderId = order.Id,
                ChangeType = "Create",
                Description = "Utworzono nowe zamówienie",
                NewValue = JsonSerializer.Serialize(order),
                UserId = userId,
                UserName = userName
            };
        }
        
        // Utwórz wpis historii dla aktualizacji zamówienia
        public static OrderHistory ForUpdate(Order oldOrder, Order newOrder, int userId, string userName)
        {
            return new OrderHistory
            {
                OrderId = newOrder.Id,
                ChangeType = "Update",
                Description = "Zaktualizowano zamówienie",
                OldValue = JsonSerializer.Serialize(oldOrder),
                NewValue = JsonSerializer.Serialize(newOrder),
                UserId = userId,
                UserName = userName
            };
        }
        
        // Utwórz wpis historii dla zmiany statusu
        public static OrderHistory ForStatusChange(Order order, string oldStatus, string newStatus, int userId, string userName)
        {
            return new OrderHistory
            {
                OrderId = order.Id,
                ChangeType = "StatusChange",
                Description = $"Zmieniono status z '{oldStatus}' na '{newStatus}'",
                OldValue = oldStatus,
                NewValue = newStatus,
                UserId = userId,
                UserName = userName
            };
        }
    }
}