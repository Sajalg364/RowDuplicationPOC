using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LoanApi.Models
{
    public class Attachment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? FileName { get; set; }

        public string? ContentType { get; set; }

        // Public URL to serve the file (e.g. /uploads/abc.pdf)
        public string? Url { get; set; }

        [ForeignKey("Loan")]
        public int LoanID { get; set; }
        public Loan? Loan { get; set; }
    }
}
