using Pluteo.Domain.Models.Entities;
using Pluteo.Infrastructure.Repositories.Models;
using AutoMapper;

namespace Pluteo.Infrastructure.AutoMapperProfiles;
public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserModel>().ReverseMap();
    }
}
