
namespace Pluteo.Domain.Interfaces.Services;
public interface IBaseEntityService<TEntity, TEntityId>
{
    Task Update(TEntity entity);
    Task Delete(TEntityId entityId);
    Task<List<TEntity>> List();
    Task<TEntity> GetById(TEntityId entityId);
}
