using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OrdersManagement.Backend.Models;

namespace OrdersManagement.Backend.Data.Repositories
{
    public class OrderCommentRepository : IOrderCommentRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderCommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderComment>> GetCommentsByOrderIdAsync(int orderId)
        {
            return await _context.OrderComments
                .Where(c => c.OrderId == orderId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<OrderComment> GetCommentByIdAsync(int id)
        {
            return await _context.OrderComments.FindAsync(id);
        }

        public async Task<OrderComment> AddCommentAsync(OrderComment comment)
        {
            _context.OrderComments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<OrderComment> UpdateCommentAsync(OrderComment comment)
        {
            _context.Entry(comment).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await CommentExistsAsync(comment.Id))
                {
                    return null;
                }
                throw;
            }

            return comment;
        }

        public async Task<bool> DeleteCommentAsync(int id)
        {
            var comment = await _context.OrderComments.FindAsync(id);
            if (comment == null)
            {
                return false;
            }

            _context.OrderComments.Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<bool> CommentExistsAsync(int id)
        {
            return await _context.OrderComments.AnyAsync(c => c.Id == id);
        }
    }
}