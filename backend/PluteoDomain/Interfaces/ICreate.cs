namespace Pluteo.Domain.Interfaces;
public interface ICreate<IEntity>
{
    Task Create(IEntity entity);        
}
