namespace Pluteo.Domain.Interfaces;
public interface IUpdate<TEntity>
{
    Task Update(TEntity entity);
}
