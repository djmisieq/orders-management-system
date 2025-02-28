using System.Collections.Generic;
using System.Threading.Tasks;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public interface IOrderCommentRepository
    {
        Task<IEnumerable<OrderComment>> GetCommentsByOrderIdAsync(int orderId);
        Task<OrderComment> GetCommentByIdAsync(int id);
        Task<OrderComment> AddCommentAsync(OrderComment comment);
        Task<OrderComment> UpdateCommentAsync(OrderComment comment);
        Task<bool> DeleteCommentAsync(int id);
    }
}