using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace OrdersManagement.Backend.Models
{
    public class Resource
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        // Type of resource: Machine, Person, Tool, etc.
        [Required]
        [MaxLength(50)]
        public string ResourceType { get; set; }
        
        // Department or area where the resource is located
        [MaxLength(100)]
        public string Department { get; set; }
        
        // Capacity per time unit (e.g., items per hour)
        public decimal? Capacity { get; set; }
        
        // Cost per hour
        public decimal? CostPerHour { get; set; }
        
        // Skills or capabilities (for people) or features (for machines)
        [MaxLength(500)]
        public string Capabilities { get; set; }
        
        // Availability information
        public bool IsActive { get; set; } = true;
        
        // Working hours (e.g., "08:00-16:00")
        [MaxLength(50)]
        public string WorkingHours { get; set; }
        
        // Days off (e.g., "Saturday,Sunday")
        [MaxLength(100)]
        public string DaysOff { get; set; }
        
        // Notes about the resource
        [MaxLength(500)]
        public string Notes { get; set; }
        
        // Navigation properties
        public virtual ICollection<ProductionTask> AssignedTasks { get; set; } = new List<ProductionTask>();
    }
}