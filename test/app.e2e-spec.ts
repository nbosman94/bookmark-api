
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {Test} from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import {AppModule} from '../src/app.module'
import { describe } from 'node:test';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';



describe('App e2e', () => {
      let app: INestApplication;
      let prisma: PrismaService

        beforeAll(async () => {
          const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
          }).compile();
           app = moduleRef.createNestApplication();
           app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
          }),
        );
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService)
        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333')
        });

        afterAll(() => {
          app.close();
        });

        describe('Auth', () => {

          const dto: AuthDto = {
            email: 'kirk@gmail.com',
            password: 'random',
          }

          describe('Signup', () => {

            it('Should throw if email empty', () => {
              return pactum.spec().post('/auth/signup').withBody({
                password: dto.password
              }).expectStatus(400)
            })

            it('Should throw if password empty', () => {
              return pactum.spec().post('/auth/signup').withBody({
                email: dto.email
              }).expectStatus(400)
            })

            it('Should throw if no body provided', () => {
              return pactum.spec().post('/auth/signup').expectStatus(400)
            })

            it('should signup', () => {
              return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
            })

          });
          describe('Signin', () => {

            it('should signin', () => {
              return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAt', 'access_token')
            })
            it('Should throw if no body provided', () => {
              return pactum.spec().post('/auth/signin').expectStatus(400)
            })

            it('Should throw if email empty', () => {
              return pactum.spec().post('/auth/signin').withBody({
                password: dto.password
              }).expectStatus(400)
            })

            it('Should throw if password empty', () => {
              return pactum.spec().post('/auth/signin').withBody({
                email: dto.email
              }).expectStatus(400)
            })

          });
        })

        describe('User', () => {
          describe('Get me', () => {
            it('should get current user', () => {
              return pactum.spec().get('/users/me').withHeaders({
                Authorization: 'Bearer $S{userAt}',
              }).expectStatus(200)
            })
          } )


          describe('Edit user', () => {
            it('should edit user', () => {
              const editdto: EditUserDto = {
                firstName: 'Kirk',
                email: 'kirk1234@gmail.com',
              };
              return pactum
                .spec()
                .patch('/users')
                .withHeaders({
                  Authorization: 'Bearer $S{userAt}',
                })
                .withBody(editdto)
                .expectStatus(200)
                .expectBodyContains(editdto.firstName)
                .expectBodyContains(editdto.email);
            });
          })
        })


        describe('Bookmarks', () => {
          describe('Create bookmark', () => {});
          describe('Get bookmarks', () => {});

          describe('Get book by id', () => {});

          describe('Edit bookmark', () => {});
          describe('Delete bookmark', () => {});

        })
       

});
