using Pluteo.Domain.Models.Entities;
using Pluteo.Infrastructure.Repositories.Models;
using AutoMapper;

namespace Pluteo.Infrastructure.AutoMapperProfiles;
public class UserProfile : Profile
{
    public UserProfile()
    {
        CreateMap<User, UserModel>().ReverseMap();
        CreateMap<UserSettings, UserSettingsModel>().ReverseMap();
        CreateMap<Notification, NotificationModel>().ReverseMap();
        CreateMap<Shelf, ShelfModel>().ReverseMap();
        CreateMap<ShelfBook, ShelfBookModel>().ReverseMap();
    }
}
