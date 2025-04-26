namespace Pluteo.Domain.Interfaces.Repositories;
public interface IUserRepository<TEntity, TEntityId>
    : IBaseRepository<TEntity, TEntityId>
{
    Task<List<TEntity>> ListWithLoans();
}