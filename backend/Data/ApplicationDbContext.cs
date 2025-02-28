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
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Order configuration
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Attributes)
                .WithOne(a => a.Order)
                .HasForeignKey(a => a.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Sample seed data
            modelBuilder.Entity<Order>().HasData(
                new Order 
                { 
                    Id = 1, 
                    CustomerName = "ACME Corp", 
                    OrderDate = new System.DateTime(2023, 1, 15),
                    Quantity = 10,
                    Status = "In Progress",
                    Description = "Standard order from regular customer"
                },
                new Order 
                { 
                    Id = 2, 
                    CustomerName = "Tech Solutions", 
                    OrderDate = new System.DateTime(2023, 2, 20),
                    Quantity = 5,
                    Status = "Completed",
                    Description = "Rush order, high priority"
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
        }
    }
}
