import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { AuthDTO } from "./dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async signup(dto: AuthDTO) {
    // generate the password
    const hash = await argon.hash(dto.password)
    // save the new user in the DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash
        }
      })
      delete user.hash

      return user
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code == 'P2002') {
          throw new ForbiddenException('Credentials taken!')
        }
      }
      throw err
    }

  }

  signin() {
    return { msg: 'I have signin' }
  }
}
