import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import * as argon from 'argon2'
import { AuthDTO } from './dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDTO) {
    // generate the password
    const hash = await argon.hash(dto.password)
    // save the new user in the DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      })
      return this.signToken(user.id, user.email)
    } catch (err) {
      if (
        err instanceof
        PrismaClientKnownRequestError
      ) {
        if (err.code == 'P2002') {
          throw new ForbiddenException(
            'Credentials taken!',
          )
        }
      }
      throw err
    }
  }

  async signin(dto: AuthDTO) {
    // find the user by email
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })
    // user not existed -> throw exception
    if (!user)
      throw new ForbiddenException(
        'Credential incorrect!',
      )
    // check password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    )
    // not correct -> throw exception
    if (!pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect!',
      )
    // send back the user
    return this.signToken(user.id, user.email)
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    }
    const secret = this.config.get('JWT_SECRET')
    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret,
      },
    )

    return {
      access_token: token,
    }
  }
}
