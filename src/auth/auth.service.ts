import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

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
      const newUser = new this.userModel( createUserDto );
      // 1- Encriptar la contrasena
      // 2- Guardar el usuario
      // 3- Generar el JWT

      return await newUser.save();
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
