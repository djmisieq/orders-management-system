using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OrdersManagement.Backend.Models
{
    public class ProductionTask
    {
        [Key]
        public int Id { get; set; }
        
        // Order associated with this task
        public int OrderId { get; set; }
        
        // Title of the task
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        
        // Description of what needs to be done
        [MaxLength(1000)]
        public string Description { get; set; }
        
        // Task type: Preparation, Production, Assembly, Testing, Packaging, etc.
        [Required]
        [MaxLength(50)]
        public string TaskType { get; set; }
        
        // Priority (1-5)
        public int Priority { get; set; } = 3;
        
        // Status: Planned, InProgress, Completed, OnHold, Cancelled
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Planned";
        
        // Time estimates
        
        // Estimated duration in minutes
        public int EstimatedDuration { get; set; }
        
        // Actual duration in minutes (filled after completion)
        public int? ActualDuration { get; set; }
        
        // Scheduling information
        
        // Planned start time
        public DateTime PlannedStartTime { get; set; }
        
        // Planned end time
        public DateTime PlannedEndTime { get; set; }
        
        // Actual start time (filled when task starts)
        public DateTime? ActualStartTime { get; set; }
        
        // Actual end time (filled after completion)
        public DateTime? ActualEndTime { get; set; }
        
        // Task dependencies
        
        // Predecessor tasks that must be completed before this task can start
        public string PredecessorTaskIds { get; set; }
        
        // Progress information
        
        // Completion percentage (0-100)
        public int CompletionPercentage { get; set; } = 0;
        
        // Notes or comments about the task
        [MaxLength(500)]
        public string Notes { get; set; }
        
        // Creation and modification tracking
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int CreatedById { get; set; }
        [MaxLength(100)]
        public string CreatedByName { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        [MaxLength(100)]
        public string UpdatedByName { get; set; }
        
        // Navigation properties
        
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; }
        
        // Resources assigned to this task
        public virtual ICollection<Resource> AssignedResources { get; set; } = new List<Resource>();
    }
}