namespace LoanApi.Models
{
    public class Loan
    {
        public int LoanID { get; set; }
        public string Borrower { get; set; } = "";
        public decimal Amount { get; set; }
        public string Purpose { get; set; } = "";
        public string Branch { get; set; } = "";
        public string DocumentType { get; set; } = "";
        public string? AttachmentsJson { get; set; }
    }
}
