using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdersManagement.Backend.Models
{
    public class TaskResourceAssignment
    {
        [Key]
        public int Id { get; set; }
        
        // The task this assignment belongs to
        public int TaskId { get; set; }
        
        // The resource being assigned
        public int ResourceId { get; set; }
        
        // Assignment timing
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        // Amount of resource allocated (e.g., percentage of capacity)
        // For example, a person might be assigned at 50% capacity if working on multiple tasks
        public decimal AllocationPercentage { get; set; } = 100;
        
        // Notes about this specific assignment
        [MaxLength(500)]
        public string Notes { get; set; }
        
        // Creation tracking
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedById { get; set; }
        [MaxLength(100)]
        public string CreatedByName { get; set; }
        
        // Navigation properties
        [ForeignKey("TaskId")]
        public virtual ProductionTask Task { get; set; }
        
        [ForeignKey("ResourceId")]
        public virtual Resource Resource { get; set; }
    }
}