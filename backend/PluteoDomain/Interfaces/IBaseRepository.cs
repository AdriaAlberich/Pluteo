namespace Pluteo.Domain.Interfaces;
public interface IBaseRepository<TEntity, TEntityId>
    : ICreate<TEntity>, IUpdate<TEntity>, IDelete<TEntityId>, IList<TEntity, TEntityId>
{
    
}