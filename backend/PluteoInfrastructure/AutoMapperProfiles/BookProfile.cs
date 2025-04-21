using Pluteo.Domain.Models.Entities;
using Pluteo.Infrastructure.Repositories.Models;
using AutoMapper;

namespace Pluteo.Infrastructure.AutoMapperProfiles;
public class BookProfile : Profile
{
    public BookProfile()
    {
        CreateMap<Book, BookModel>().ReverseMap();
    }
}
