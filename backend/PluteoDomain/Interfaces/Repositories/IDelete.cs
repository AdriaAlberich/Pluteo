namespace Pluteo.Domain.Interfaces.Repositories;
public interface IDelete<TEntityId>
{
    Task Delete(TEntityId entityId);
}
