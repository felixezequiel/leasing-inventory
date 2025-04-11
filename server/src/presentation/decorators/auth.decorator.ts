import { createParamDecorator } from 'routing-controllers';
import { Request } from 'express';
import { User } from '@domain/entities/User';

// Decorator para obter o usuário autenticado da requisição
export function CurrentUser() {
  return createParamDecorator({
    value: action => {
      const request = action.request as Request;
      return request.user as User;
    },
  });
}

// Decorator para marcar uma rota como pública (não requer autenticação)
export function Public() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      Reflect.defineMetadata('isPublic', true, descriptor.value);
    } else {
      Reflect.defineMetadata('isPublic', true, target);
    }
  };
}

// Decorator para marcar uma rota como protegida (requer autenticação)
export function Protected() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (descriptor) {
      Reflect.defineMetadata('isProtected', true, descriptor.value);
    } else {
      Reflect.defineMetadata('isProtected', true, target);
    }
  };
} 