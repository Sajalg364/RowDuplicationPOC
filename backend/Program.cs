using LoanApi.Data;
using LoanApi.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// SQLite file next to the app; name it loans.db
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=loans4.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// enable CORS for Angular dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // create DB + apply migrations (if using migrations) / ensure created
    db.Database.EnsureCreated();
    db.EnsureSeedData();
}

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseCors("AllowAngularDev");

// Minimal API endpoints
app.MapGet("/api/loans", async (AppDbContext db) =>
    await db.Loans.OrderBy(l => l.LoanID).ToListAsync());

app.MapGet("/api/loans/{id:int}", async (int id, AppDbContext db) =>
    await db.Loans.FindAsync(id) is Loan loan ? Results.Ok(loan) : Results.NotFound());

app.MapPost("/api/loans", async (Loan loan, AppDbContext db) =>
{
    // let EF generate a key if LoanID not set, but keep passed LoanID if provided
    db.Loans.Add(loan);
    await db.SaveChangesAsync();
    return Results.Created($"/api/loans/{loan.LoanID}", loan);
});

app.MapPut("/api/loans/{id:int}", async (int id, Loan updated, AppDbContext db) =>
{
    var existing = await db.Loans.FindAsync(id);
    if (existing == null) return Results.NotFound();

    existing.Borrower = updated.Borrower;
    existing.Amount = updated.Amount;
    existing.Purpose = updated.Purpose;
    existing.Branch = updated.Branch;
    existing.DocumentType = updated.DocumentType;
    existing.AttachmentsJson = updated.AttachmentsJson;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/loans/{id:int}", async (int id, AppDbContext db) =>
{
    var loan = await db.Loans.FindAsync(id);
    if (loan == null) return Results.NotFound();
    db.Loans.Remove(loan);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
