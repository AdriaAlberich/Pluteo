namespace Pluteo.Domain.Interfaces.Repositories;
public interface IUpdate<TEntity>
{
    Task Update(TEntity entity);
}
