using Microsoft.EntityFrameworkCore;
using OrdersManagementSystem.API.Models;

namespace OrdersManagementSystem.API.Data
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

            modelBuilder.Entity<Order>()
                .HasMany(o => o.Attributes)
                .WithOne(oa => oa.Order)
                .HasForeignKey(oa => oa.OrderId);
        }
    }
}