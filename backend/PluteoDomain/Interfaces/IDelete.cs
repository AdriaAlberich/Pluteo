namespace Pluteo.Domain.Interfaces;
public interface IDelete<TEntityId>
{
    Task Delete(TEntityId entityId);
}
