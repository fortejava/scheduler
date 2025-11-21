/// <summary>
/// Authorization levels for HTTP handlers.
/// Used by BaseHandler to determine what authentication/authorization is required.
/// </summary>
public enum AuthLevel
{
    /// <summary>
    /// No authentication required.
    /// Use for: Login.ashx, Setup.ashx
    /// </summary>
    Anonymous = 0,

    /// <summary>
    /// Valid token required, any role allowed.
    /// Use for: View operations (GetInvoices, GetCustomers, GetInvoiceYears)
    /// Allowed roles: Admin, User, Visitor
    /// </summary>
    ValidToken = 1,

    /// <summary>
    /// Admin or User role required.
    /// Use for: Modify/Delete operations (CreateInvoice, UpdateInvoice, DeleteInvoice, CreateCustomer, UpdateCustomer, DeleteCustomer)
    /// Allowed roles: Admin, User
    /// Forbidden: Visitor
    /// </summary>
    AdminOrUser = 2,

    /// <summary>
    /// Admin role only.
    /// Use for: User management operations (GetUsers, CreateUser, UpdateUser, DeleteUser)
    /// Allowed roles: Admin
    /// Forbidden: User, Visitor
    /// </summary>
    AdminOnly = 3
}
