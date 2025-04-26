namespace Pluteo.Domain.Interfaces.Repositories;
public interface IBaseRepository<TEntity, TEntityId>
    : ICreate<TEntity>, IUpdate<TEntity>, IDelete<TEntityId>, IList<TEntity, TEntityId>
{
    
}