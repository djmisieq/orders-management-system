using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public class OrderHistoryRepository : IOrderHistoryRepository
    {
        private readonly ApplicationDbContext _context;
        
        public OrderHistoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<OrderHistory>> GetHistoryByOrderIdAsync(int orderId)
        {
            return await _context.OrderHistory
                .Where(h => h.OrderId == orderId)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();
        }
        
        public async Task<OrderHistory> GetHistoryEntryByIdAsync(int id)
        {
            return await _context.OrderHistory.FindAsync(id);
        }
        
        public async Task<OrderHistory> AddHistoryEntryAsync(OrderHistory historyEntry)
        {
            _context.OrderHistory.Add(historyEntry);
            await _context.SaveChangesAsync();
            return historyEntry;
        }
        
        public async Task<IEnumerable<OrderHistory>> GetRecentHistoryEntriesAsync(int count)
        {
            return await _context.OrderHistory
                .OrderByDescending(h => h.ChangedAt)
                .Take(count)
                .Include(h => h.Order)
                .ToListAsync();
        }
    }
}