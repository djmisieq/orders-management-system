using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IOrderHistoryRepository
    {
        Task<IEnumerable<OrderHistory>> GetHistoryByOrderIdAsync(int orderId);
        Task<OrderHistory> GetHistoryEntryByIdAsync(int id);
        Task<OrderHistory> AddHistoryEntryAsync(OrderHistory historyEntry);
        Task<IEnumerable<OrderHistory>> GetRecentHistoryEntriesAsync(int count);
    }
}