import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs  from 'bcryptjs';

import { CreateUserDto, UpdateAuthDto, LoginDto, RegisterUserDto } from './dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';


@Injectable()
export class AuthService {

  constructor(

    // CON ESTE MODELO YO YA PUEDO HACER TODAS LAS INTERACCIONES A LA BASE DE DATOS RELACIONADA O
    // -TODO LO QUE TENGA DEFINIDO EN ESE SCHEMA.
    @InjectModel( User.name )
    private userModel: Model<User>,
    private jwtService: JwtService,
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

  async login( loginDto: LoginDto ): Promise<LoginResponse> {
    /**
     * User { __dirname, name, email, roles }
     * Token -> ASASDCDCD.DSDSCD.CSDSDS
    */
    console.log({ loginDto })

    const { email , password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if  (!user) {
      throw new UnauthorizedException('Not valid credentials - email')
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    }

  }

  async register( registerDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create( registerDto );
    console.log({ user })

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById(id);
    const { password:_, ...rest }  = user.toJSON();
    return rest;
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

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
