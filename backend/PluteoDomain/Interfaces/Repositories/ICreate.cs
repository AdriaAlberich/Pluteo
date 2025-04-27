namespace Pluteo.Domain.Interfaces.Repositories;
public interface ICreate<IEntity>
{
    Task Create(IEntity entity);        
}
