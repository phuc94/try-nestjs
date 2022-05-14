import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import * as pactum from 'pactum'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import { AppModule } from '../src/app.module'
import { AuthDTO } from 'src/auth/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    await app.init()
    await app.listen(3333)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl(
      'http://localhost:3333/',
    )
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDTO = {
      email: 'phuc@gmail.com',
      password: '123',
    }
    describe('SignUp', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })
      it('should throw if body not provided', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .expectStatus(400)
      })

      it('should signup', () => {
        return pactum
          .spec()
          .post('auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })
    describe('SignIn', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })
      it('should throw if body not provided', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .expectStatus(400)
      })
      it('should sign in', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {})
    describe('Edit user', () => {})
  })

  describe('Bookmark', () => {
    describe('Create bookmark', () => {})
    describe('Get bookmark', () => {})
    describe('Get bookmark by Id', () => {})
    describe('Edit bookmark', () => {})
    describe('Delete bookmark', () => {})
  })
})
