using Pluteo.Domain.Interfaces;
using Pluteo.Domain.Models.Entities;
using Pluteo.Domain.Models.Settings;
using Pluteo.Infrastructure.Repositories.Models;
using MongoDB.Driver;
using AutoMapper;

namespace Pluteo.Infrastructure.Repositories;
public class BookRepository : IBaseRepository<Book, Guid>
{
    private readonly IMongoDatabase _db;

    private readonly IMongoCollection<BookModel> _collection;

    private readonly IMapper _mapper;

    public BookRepository(DatabaseSettings databaseSettings, IMongoClient mongoClient, IMapper mapper)
    {
        _db = mongoClient.GetDatabase(databaseSettings.DatabaseName);
        _collection = _db.GetCollection<BookModel>(databaseSettings.BookCollectionName);
        _mapper = mapper;
    }

    public async Task Create(Book book)
    {
        var model = _mapper.Map<Book, BookModel>(book);
        await _collection.InsertOneAsync(model);
    }

    public async Task Update(Book book)
    {
        var updateDefinitions = new List<UpdateDefinition<BookModel>>();
        var model = _mapper.Map<Book, BookModel>(book);

        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.Title, model.Title));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.ISBN, model.ISBN));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.Cover, model.Cover));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.Authors, model.Authors));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.Tags, model.Tags));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.Publishers, model.Publishers));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.PublishDate, model.PublishDate));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.NumPages, model.NumPages));
        updateDefinitions.Add(Builders<BookModel>.Update.Set(x => x.HasEbook, model.HasEbook));

        var updateDefinition = Builders<BookModel>.Update.Combine(updateDefinitions);
        await _collection.UpdateOneAsync(x => x.Id == model.Id, updateDefinition);
    }

    public async Task Delete(Guid bookId)
    {
        await _collection.DeleteOneAsync(x => x.Id == bookId);
    }

    public async Task<Book> GetById(Guid bookId)
    {
        var model = await _collection.Find(x => x.Id == bookId).FirstOrDefaultAsync();
        return _mapper.Map<BookModel, Book>(model);
    }

    public async Task<List<Book>> List()
    {
        var modelList = await _collection.Find(_ => true).ToListAsync();

        return _mapper.Map<List<BookModel>, List<Book>>(modelList);
    }
}
