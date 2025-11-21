using Microsoft.EntityFrameworkCore;
using LoanApi.Models;
using System.Text.Json;

namespace LoanApi.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Loan> Loans { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }

        // optional: seed initial data if none exists
        public void EnsureSeedData()
        {
            if (!Loans.Any())
            {
                var sample = new List<Loan>
                {
                    new Loan { LoanID = 1001, Borrower="Amit Sharma", Amount=250000, Purpose="Home Renovation", Branch="Mumbai - Andheri", DocumentType="Lending", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1002, Borrower="Priya Rao", Amount=500000, Purpose="Business Expansion", Branch="Bengaluru - Koramangala", DocumentType="Investment", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1003, Borrower="Ravi Kumar", Amount=150000, Purpose="Medical Expenses", Branch="Delhi - South Ext", DocumentType="Service", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1004, Borrower="Sneha Patel", Amount=350000, Purpose="Vehicle Purchase", Branch="Ahmedabad - CG Road", DocumentType="Lending", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1005, Borrower="Karan Verma", Amount=100000, Purpose="Education", Branch="Chennai - T Nagar", DocumentType="Investment", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1006, Borrower="Meera Joshi", Amount=200000, Purpose="Wedding Expenses", Branch="Pune - Kalyani Nagar", DocumentType="Service", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1007, Borrower="Ajay Singh", Amount=450000, Purpose="Business Working Capital", Branch="Kolkata - Park Street", DocumentType="Investment", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1008, Borrower="Nidhi Agarwal", Amount=80000, Purpose="Laptop Purchase", Branch="Hyderabad - Banjara Hills", DocumentType="Lending", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1009, Borrower="Vikram Rao", Amount=300000, Purpose="Factory Equipment", Branch="Surat - Udhna", DocumentType="Investment", AttachmentsJson = "[]" },
                    new Loan { LoanID = 1010, Borrower="Sheetal Desai", Amount=120000, Purpose="Home Appliances", Branch="Lucknow - Hazratganj", DocumentType="Service", AttachmentsJson = "[]" },
                };
                Loans.AddRange(sample);
                SaveChanges();
            }
        }
    }
}
