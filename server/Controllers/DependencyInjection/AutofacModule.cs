using Autofac;
using Repository.Interfaces.Base;
using Repository.Interfaces.System;
using Repository.Repositories.Base;
using Service.Interfaces.Base;
using Service.Services;
using Service.Services.Base;
using System.Reflection;

namespace Controllers.DependencyInjection;

public class AutofacModule : Autofac.Module
{
    protected override void Load(ContainerBuilder builder)
    {
        // Register generic repository and service types
        builder.RegisterGeneric(typeof(GenericRepository<,>))
            .As(typeof(IGenericRepository<,>))
            .InstancePerLifetimeScope();

        builder.RegisterGeneric(typeof(GenericService<,>))
            .As(typeof(IGenericService<,>))
            .InstancePerLifetimeScope();

        // Get assemblies for scanning
        var repositoryAssembly = Assembly.GetAssembly(typeof(IUserRepository));
        var serviceAssembly = Assembly.GetAssembly(typeof(AuthService));

        if (repositoryAssembly != null)
        {
            // Register all repositories
            builder.RegisterAssemblyTypes(repositoryAssembly)
                .Where(t => t.Name.EndsWith("Repository") &&
                           !t.IsAbstract &&
                           !t.IsGenericTypeDefinition)
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
        }

        if (serviceAssembly != null)
        {
            // Register all services
            builder.RegisterAssemblyTypes(serviceAssembly)
                .Where(t => t.Name.EndsWith("Service") &&
                           !t.IsAbstract &&
                           !t.IsGenericTypeDefinition)
                .AsImplementedInterfaces()
                .InstancePerLifetimeScope();
        }
    }
}
