namespace OrdersManagementSystem.API.Models
{
    public class OrderAttribute
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order? Order { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
    }
}