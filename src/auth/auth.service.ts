import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs  from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';


@Injectable()
export class AuthService {

  constructor(

    // CON ESTE MODELO YO YA PUEDO HACER TODAS LAS INTERACCIONES A LA BASE DE DATOS RELACIONADA O
    // -TODO LO QUE TENGA DEFINIDO EN ESE SCHEMA.
    @InjectModel( User.name )
    private userModel: Model<User>
    // END

  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // console.log( createUserDto )
    try {

      // 1- Encriptar la contrasena
      // 2- Guardar el usuario
      // 3- Generar el JWT

      const { password, ...userData } = createUserDto;
      
      const newUser = new this.userModel({
        // La clave se encripta con este metodo
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();

      //Excluyendo la variable password y regresando( user ) todo lo demas
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error: any) {
      console.log(error.code)
      if ( error.code  === 11000 ) {
        throw new BadRequestException( `${ createUserDto.email } already exists!` );
      }
      throw new InternalServerErrorException('Something terrible happen!!!');
    }

  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
