using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }
        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderAttribute> OrderAttributes { get; set; }
        public DbSet<OrderComment> OrderComments { get; set; }
        public DbSet<OrderHistory> OrderHistory { get; set; }
        
        // Production scheduling models
        public DbSet<Resource> Resources { get; set; }
        public DbSet<ProductionTask> ProductionTasks { get; set; }
        public DbSet<TaskResourceAssignment> TaskResourceAssignments { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Order configuration
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Attributes)
                .WithOne(a => a.Order)
                .HasForeignKey(a => a.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Order Comments configuration
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Comments)
                .WithOne(c => c.Order)
                .HasForeignKey(c => c.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Order History configuration
            modelBuilder.Entity<Order>()
                .HasMany(o => o.History)
                .WithOne(h => h.Order)
                .HasForeignKey(h => h.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Production Task to Order relationship
            modelBuilder.Entity<ProductionTask>()
                .HasOne(t => t.Order)
                .WithMany()
                .HasForeignKey(t => t.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Many-to-many relationship between ProductionTask and Resource
            modelBuilder.Entity<TaskResourceAssignment>()
                .HasOne(tra => tra.Task)
                .WithMany()
                .HasForeignKey(tra => tra.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<TaskResourceAssignment>()
                .HasOne(tra => tra.Resource)
                .WithMany()
                .HasForeignKey(tra => tra.ResourceId)
                .OnDelete(DeleteBehavior.Restrict); // Don't cascade delete resources
                
            // Sample seed data
            modelBuilder.Entity<Order>().HasData(
                new Order 
                { 
                    Id = 1, 
                    CustomerName = "ACME Corp", 
                    OrderDate = new System.DateTime(2023, 1, 15),
                    Quantity = 10,
                    Status = "In Progress",
                    Description = "Standard order from regular customer",
                    Priority = 3,
                    InternalStatus = "Production Planning"
                },
                new Order 
                { 
                    Id = 2, 
                    CustomerName = "Tech Solutions", 
                    OrderDate = new System.DateTime(2023, 2, 20),
                    Quantity = 5,
                    Status = "Completed",
                    Description = "Rush order, high priority",
                    Priority = 5,
                    InternalStatus = "Delivered",
                    ActualCompletionDate = new System.DateTime(2023, 3, 1)
                }
            );
            
            modelBuilder.Entity<OrderAttribute>().HasData(
                new OrderAttribute 
                { 
                    Id = 1, 
                    OrderId = 1, 
                    AttributeName = "Color", 
                    AttributeValue = "Red",
                    AttributeType = "string"
                },
                new OrderAttribute 
                { 
                    Id = 2, 
                    OrderId = 1, 
                    AttributeName = "Size", 
                    AttributeValue = "Large",
                    AttributeType = "string"
                },
                new OrderAttribute 
                { 
                    Id = 3, 
                    OrderId = 2, 
                    AttributeName = "Priority", 
                    AttributeValue = "High",
                    AttributeType = "string"
                }
            );
            
            // Sample comments for orders
            modelBuilder.Entity<OrderComment>().HasData(
                new OrderComment
                {
                    Id = 1,
                    OrderId = 1,
                    Content = "Klient prosi o kontakt przed wysyłką",
                    UserId = 1,
                    UserName = "Administrator Systemu",
                    CreatedAt = new System.DateTime(2023, 1, 15, 10, 0, 0)
                },
                new OrderComment
                {
                    Id = 2,
                    OrderId = 1,
                    Content = "Potwierdzam, że skontaktowałem się z klientem",
                    UserId = 2,
                    UserName = "Zwykły Użytkownik",
                    CreatedAt = new System.DateTime(2023, 1, 16, 14, 30, 0)
                }
            );
            
            // Sample history entries
            modelBuilder.Entity<OrderHistory>().HasData(
                new OrderHistory
                {
                    Id = 1,
                    OrderId = 1,
                    ChangeType = "Create",
                    Description = "Utworzono nowe zamówienie",
                    UserId = 1,
                    UserName = "Administrator Systemu",
                    ChangedAt = new System.DateTime(2023, 1, 15, 9, 0, 0)
                },
                new OrderHistory
                {
                    Id = 2,
                    OrderId = 1,
                    ChangeType = "StatusChange",
                    Description = "Zmieniono status z 'New' na 'In Progress'",
                    OldValue = "New",
                    NewValue = "In Progress",
                    UserId = 1,
                    UserName = "Administrator Systemu",
                    ChangedAt = new System.DateTime(2023, 1, 15, 9, 30, 0)
                }
            );
            
            // Sample resources
            modelBuilder.Entity<Resource>().HasData(
                new Resource
                {
                    Id = 1,
                    Name = "Maszyna CNC #1",
                    ResourceType = "Machine",
                    Department = "Produkcja",
                    Capacity = 10,
                    CostPerHour = 150,
                    Capabilities = "Cięcie, Wiercenie, Frezowanie",
                    IsActive = true,
                    WorkingHours = "08:00-20:00",
                    DaysOff = "Sunday"
                },
                new Resource
                {
                    Id = 2,
                    Name = "Jan Kowalski",
                    ResourceType = "Person",
                    Department = "Produkcja",
                    Capabilities = "Operator CNC, Technik",
                    IsActive = true,
                    WorkingHours = "08:00-16:00",
                    DaysOff = "Saturday,Sunday"
                },
                new Resource
                {
                    Id = 3,
                    Name = "Stanowisko montażowe #2",
                    ResourceType = "Workstation",
                    Department = "Montaż",
                    Capacity = 5,
                    CostPerHour = 50,
                    IsActive = true,
                    WorkingHours = "08:00-16:00",
                    DaysOff = "Saturday,Sunday"
                }
            );
            
            // Sample production tasks
            modelBuilder.Entity<ProductionTask>().HasData(
                new ProductionTask
                {
                    Id = 1,
                    OrderId = 1,
                    Title = "Przygotowanie materiałów",
                    Description = "Przygotowanie materiałów do produkcji zamówienia ACME Corp",
                    TaskType = "Preparation",
                    Priority = 3,
                    Status = "Completed",
                    EstimatedDuration = 120, // 2 hours
                    ActualDuration = 90, // 1.5 hours
                    PlannedStartTime = new System.DateTime(2023, 1, 16, 8, 0, 0),
                    PlannedEndTime = new System.DateTime(2023, 1, 16, 10, 0, 0),
                    ActualStartTime = new System.DateTime(2023, 1, 16, 8, 0, 0),
                    ActualEndTime = new System.DateTime(2023, 1, 16, 9, 30, 0),
                    CompletionPercentage = 100,
                    CreatedById = 1,
                    CreatedByName = "Administrator Systemu"
                },
                new ProductionTask
                {
                    Id = 2,
                    OrderId = 1,
                    Title = "Produkcja komponentów",
                    Description = "Produkcja komponentów na maszynie CNC",
                    TaskType = "Production",
                    Priority = 3,
                    Status = "In Progress",
                    EstimatedDuration = 480, // 8 hours
                    PlannedStartTime = new System.DateTime(2023, 1, 16, 10, 0, 0),
                    PlannedEndTime = new System.DateTime(2023, 1, 16, 18, 0, 0),
                    ActualStartTime = new System.DateTime(2023, 1, 16, 10, 0, 0),
                    PredecessorTaskIds = "1", // Depends on task #1
                    CompletionPercentage = 60,
                    CreatedById = 1,
                    CreatedByName = "Administrator Systemu"
                }
            );
            
            // Sample task resource assignments
            modelBuilder.Entity<TaskResourceAssignment>().HasData(
                new TaskResourceAssignment
                {
                    Id = 1,
                    TaskId = 1,
                    ResourceId = 2, // Jan Kowalski
                    StartTime = new System.DateTime(2023, 1, 16, 8, 0, 0),
                    EndTime = new System.DateTime(2023, 1, 16, 9, 30, 0),
                    AllocationPercentage = 100,
                    CreatedById = 1,
                    CreatedByName = "Administrator Systemu"
                },
                new TaskResourceAssignment
                {
                    Id = 2,
                    TaskId = 2,
                    ResourceId = 1, // Maszyna CNC #1
                    StartTime = new System.DateTime(2023, 1, 16, 10, 0, 0),
                    EndTime = new System.DateTime(2023, 1, 16, 18, 0, 0),
                    AllocationPercentage = 100,
                    CreatedById = 1,
                    CreatedByName = "Administrator Systemu"
                },
                new TaskResourceAssignment
                {
                    Id = 3,
                    TaskId = 2,
                    ResourceId = 2, // Jan Kowalski
                    StartTime = new System.DateTime(2023, 1, 16, 10, 0, 0),
                    EndTime = new System.DateTime(2023, 1, 16, 18, 0, 0),
                    AllocationPercentage = 50, // Only half of his time
                    CreatedById = 1,
                    CreatedByName = "Administrator Systemu"
                }
            );
        }
    }
}