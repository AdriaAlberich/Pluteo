namespace Pluteo.Domain.Interfaces.Repositories;
public interface IList<TEntity, TEntityId>
{
    Task<List<TEntity>> List();
    Task<TEntity> GetById(TEntityId entityId);
}