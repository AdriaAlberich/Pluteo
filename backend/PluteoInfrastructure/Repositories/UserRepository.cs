using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure.Repositories.Models;
using MongoDB.Driver;
using AutoMapper;
using Pluteo.Domain.Interfaces.Repositories;

namespace Pluteo.Infrastructure.Repositories;
public class UserRepository : IUserRepository<User, Guid>
{
    private readonly IMongoDatabase _db;

    private readonly IMongoCollection<UserModel> _collection;

    private readonly IMapper _mapper;

    public UserRepository(DatabaseSettings databaseSettings, IMongoClient mongoClient, IMapper mapper)
    {
        _db = mongoClient.GetDatabase(databaseSettings.DatabaseName);
        _collection = _db.GetCollection<UserModel>(databaseSettings.UserCollectionName);
        _mapper = mapper;
    }

    public async Task Create(User user)
    {
        var model = _mapper.Map<User, UserModel>(user);
        await _collection.InsertOneAsync(model);
    }

    public async Task Update(User user)
    {
        var updateDefinitions = new List<UpdateDefinition<UserModel>>();
        var model = _mapper.Map<User, UserModel>(user);

        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.Password, model.Password));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.Roles, model.Roles));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.Notifications, model.Notifications));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.Settings, model.Settings));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.Shelves, model.Shelves));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.ActivationToken, model.ActivationToken));
        updateDefinitions.Add(Builders<UserModel>.Update.Set(x => x.ResetPasswordToken, model.ResetPasswordToken));
        
        var updateDefinition = Builders<UserModel>.Update.Combine(updateDefinitions);
        await _collection.UpdateOneAsync(x => x.Id == model.Id, updateDefinition);
    }

    public async Task Delete(Guid userId)
    {
        await _collection.DeleteOneAsync(x => x.Id == userId);
    }

    public async Task<User> GetById(Guid userId)
    {
        var model = await _collection.Find(x => x.Id == userId).FirstOrDefaultAsync();
        return _mapper.Map<UserModel, User>(model);
    }

    public async Task<List<User>> List()
    {
        var modelList = await _collection.Find(_ => true).ToListAsync();

        return _mapper.Map<List<UserModel>, List<User>>(modelList);
    }

    public async Task<List<User>> ListWithLoans()
    {
        var modelList = await _collection.Find(x => x.Shelves.Any(s => s.Books.Any(b => b.Loan != null))).ToListAsync();

        return _mapper.Map<List<UserModel>, List<User>>(modelList);
    }
}
