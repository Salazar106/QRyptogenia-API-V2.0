import { PrismaClient, ProfileType, UserStatus } from '@prisma/client'
import { generateHashedPassword } from '../src/utils/hashPassword.utils'

// import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando proceso de seed... 🌱')

  // ===== Crear Roles =====
  console.log('Creando roles... 👑')
  
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador con acceso completo al sistema',
      isSystem: true
    }
  })

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: {
      name: 'CLIENT',
      description: 'Usuario cliente estándar',
      isSystem: true
    }
  })

  // ===== Crear Permisos =====
  console.log('Creando permisos... 🔑')
  
  // Permisos para QR
  const qrPermissions = [
    { code: 'qr:create', name: 'Crear QR', category: 'QR_MANAGEMENT' },
    { code: 'qr:read', name: 'Ver QR', category: 'QR_MANAGEMENT' },
    { code: 'qr:update', name: 'Actualizar QR', category: 'QR_MANAGEMENT' },
    { code: 'qr:delete', name: 'Eliminar QR', category: 'QR_MANAGEMENT' },
    { code: 'qr:statistics', name: 'Ver estadísticas de QR', category: 'QR_ANALYTICS' }
  ]

  // Permisos para usuarios (solo admin)
  const userPermissions = [
    { code: 'user:create', name: 'Crear usuario', category: 'USER_MANAGEMENT' },
    { code: 'user:read', name: 'Ver usuario', category: 'USER_MANAGEMENT' },
    { code: 'user:update', name: 'Actualizar usuario', category: 'USER_MANAGEMENT' },
    { code: 'user:delete', name: 'Eliminar usuario', category: 'USER_MANAGEMENT' }
  ]

  // Permisos para plantillas y diseños
  const designPermissions = [
    { code: 'design:create', name: 'Crear diseño', category: 'DESIGN_MANAGEMENT' },
    { code: 'design:read', name: 'Ver diseño', category: 'DESIGN_MANAGEMENT' },
    { code: 'design:update', name: 'Actualizar diseño', category: 'DESIGN_MANAGEMENT' },
    { code: 'design:delete', name: 'Eliminar diseño', category: 'DESIGN_MANAGEMENT' }
  ]

  // Permisos para facturación y suscripciones
  const billingPermissions = [
    { code: 'billing:read', name: 'Ver facturas', category: 'BILLING' },
    { code: 'subscription:manage', name: 'Gestionar suscripción', category: 'BILLING' }
  ]

  // Unir todos los permisos
  const allPermissions = [
    ...qrPermissions,
    ...userPermissions,
    ...designPermissions,
    ...billingPermissions
  ]

  // Crear permisos en la base de datos
  for (const permission of allPermissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: {},
      create: {
        code: permission.code,
        name: permission.name,
        category: permission.category
      }
    })
  }

  // Asignar todos los permisos al rol ADMIN
  const allDbPermissions = await prisma.permission.findMany()
  
  for (const permission of allDbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    })
  }

  // Asignar permisos limitados al rol CLIENT
  const clientPermissionCodes = [
    'qr:create', 'qr:read', 'qr:update', 'qr:delete', 'qr:statistics',
    'design:create', 'design:read', 'design:update', 'design:delete',
    'billing:read', 'subscription:manage'
  ]

  const clientDbPermissions = await prisma.permission.findMany({
    where: {
      code: {
        in: clientPermissionCodes
      }
    }
  })

  for (const permission of clientDbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: clientRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: clientRole.id,
        permissionId: permission.id
      }
    })
  }

  // ===== Crear Usuarios =====
  console.log('Creando usuarios... 👤')

  // Contraseña común para pruebas
  const defaultPassword = 'User123.'
  const hashedPassword = await generateHashedPassword(defaultPassword)

  // Crear usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qryptogenia.com' },
    update: {},
    create: {
      email: 'admin@qryptogenia.com',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
      userAuth: {
        create: {
          passwordHash: hashedPassword
        }
      },
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'QRyptogenia',
          profileType: ProfileType.PERSONAL,
          preferredLanguage: 'es'
        }
      },
      userContacts: {
        create: {
          contactType: 'PHONE',
          value: '3123123123',
          isPrimary: true,
          verified: true
        }
      }
    }
  })

  // Asignar rol de administrador
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id
    }
  })

  // Crear usuario personal 1
  const personalUser1 = await prisma.user.upsert({
    where: { email: 'usuario1@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario1@ejemplo.com',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      userAuth: {
        create: {
          passwordHash: hashedPassword
        }
      },
      profile: {
        create: {
          firstName: 'Daniel',
          lastName: 'Peña',
          profileType: ProfileType.PERSONAL,
          preferredLanguage: 'es'
        }
      },
      userContacts: {
        create: {
          contactType: 'PHONE',
          value: '3101234567',
          isPrimary: true,
          verified: true
        }
      }
    }
  })

  // Crear usuario personal 2
  const personalUser2 = await prisma.user.upsert({
    where: { email: 'usuario2@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario2@ejemplo.com',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      userAuth: {
        create: {
          passwordHash: hashedPassword
        }
      },
      profile: {
        create: {
          firstName: 'María',
          lastName: 'González',
          profileType: ProfileType.PERSONAL,
          preferredLanguage: 'es'
        }
      }
    }
  })

  // Crear usuario empresarial 1
  const businessUser1 = await prisma.user.upsert({
    where: { email: 'empresa1@ejemplo.com' },
    update: {},
    create: {
      email: 'empresa1@ejemplo.com',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      userAuth: {
        create: {
          passwordHash: hashedPassword
        }
      },
      profile: {
        create: {
          firstName: 'Representante',
          lastName: 'Empresa',
          company: 'Tecnología Innovadora S.A.',
          industryType: 'Tecnología',
          profileType: ProfileType.BUSINESS,
          preferredLanguage: 'es'
        }
      },
      userContacts: {
        create: [
          {
            contactType: 'PHONE',
            value: '3209876543',
            isPrimary: true,
            verified: true
          },
          {
            contactType: 'EMAIL',
            value: 'contacto@empresa1.com',
            isPrimary: false,
            verified: true
          }
        ]
      }
    }
  })

  // Crear usuario institucional
  const institutionUser = await prisma.user.upsert({
    where: { email: 'institucion@ejemplo.com' },
    update: {},
    create: {
      email: 'institucion@ejemplo.com',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      userAuth: {
        create: {
          passwordHash: hashedPassword
        }
      },
      profile: {
        create: {
          company: 'Universidad Nacional',
          industryType: 'Educación',
          profileType: ProfileType.ORGANIZATION,
          preferredLanguage: 'es'
        }
      }
    }
  })

  // Asignar rol de cliente a los usuarios normales
  const clientUsers = [personalUser1, personalUser2, businessUser1, institutionUser]
  
  for (const user of clientUsers) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: clientRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: clientRole.id
      }
    })
  }

  // Crear tipos de QR básicos
  await prisma.qrType.upsert({
    where: { code: 'URL' },
    update: {},
    create: {
      code: 'URL',
      name: 'Enlace web',
      description: 'QR que redirecciona a una página web',
      icon: 'link',
      isActive: true,
      requiredFields: { fields: ['url'] },
      orderIndex: 1
    }
  })

  await prisma.qrType.upsert({
    where: { code: 'TEXT' },
    update: {},
    create: {
      code: 'TEXT',
      name: 'Texto plano',
      description: 'QR que muestra un mensaje de texto',
      icon: 'text',
      isActive: true,
      requiredFields: { fields: ['text'] },
      orderIndex: 2
    }
  })

  await prisma.qrType.upsert({
    where: { code: 'VCARD' },
    update: {},
    create: {
      code: 'VCARD',
      name: 'Tarjeta de contacto',
      description: 'QR con información de contacto',
      icon: 'contact',
      isActive: true,
      requiredFields: { fields: ['name', 'phone', 'email'] },
      orderIndex: 3
    }
  })

  // Añadir más tipos de QR
  await prisma.qrType.upsert({
    where: { code: 'WIFI' },
    update: {},
    create: {
      code: 'WIFI',
      name: 'Red WiFi',
      description: 'QR para conectarse a una red WiFi',
      icon: 'wifi',
      isActive: true,
      requiredFields: { fields: ['ssid', 'password', 'encryption'] },
      orderIndex: 4
    }
  })

  await prisma.qrType.upsert({
    where: { code: 'EMAIL' },
    update: {},
    create: {
      code: 'EMAIL',
      name: 'Correo electrónico',
      description: 'QR para enviar un correo electrónico',
      icon: 'email',
      isActive: true,
      requiredFields: { fields: ['email', 'subject', 'body'] },
      orderIndex: 5
    }
  })

  await prisma.qrType.upsert({
    where: { code: 'SMS' },
    update: {},
    create: {
      code: 'SMS',
      name: 'Mensaje de texto',
      description: 'QR para enviar un SMS',
      icon: 'sms',
      isActive: true,
      requiredFields: { fields: ['phone', 'message'] },
      orderIndex: 6
    }
  })

  await prisma.qrType.upsert({
    where: { code: 'LOCATION' },
    update: {},
    create: {
      code: 'LOCATION',
      name: 'Ubicación',
      description: 'QR para mostrar una ubicación en el mapa',
      icon: 'location',
      isActive: true,
      requiredFields: { fields: ['latitude', 'longitude'] },
      orderIndex: 7
    }
  })

  // Crear diseños de QR
  console.log('Creando diseños de QR... 🎨')
  
  const defaultDesign = await prisma.qrDesign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Diseño Estándar',
      foregroundColor: '#000000',
      backgroundColor: '#FFFFFF',
      cornerStyle: 'square',
      dotStyle: 'square',
      margin: 4,
      errorCorrection: 'M',
      isDefault: true,
      isSystem: true
    }
  })

  const blueDesign = await prisma.qrDesign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Azul Corporativo',
      foregroundColor: '#0056b3',
      backgroundColor: '#ffffff',
      cornerStyle: 'rounded',
      dotStyle: 'rounded',
      margin: 4,
      errorCorrection: 'M',
      isDefault: false,
      isSystem: true
    }
  })

  const greenDesign = await prisma.qrDesign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Verde Ecológico',
      foregroundColor: '#2e7d32',
      backgroundColor: '#f1f8e9',
      cornerStyle: 'dot',
      dotStyle: 'dot',
      margin: 5,
      errorCorrection: 'Q',
      isDefault: false,
      isSystem: true
    }
  })

  const purpleDesign = await prisma.qrDesign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Púrpura Elegante',
      foregroundColor: '#6a1b9a',
      backgroundColor: '#f3e5f5',
      cornerStyle: 'rounded',
      dotStyle: 'square',
      margin: 4,
      errorCorrection: 'H',
      isDefault: false,
      isSystem: true
    }
  })

  // Diseño personalizado para el usuario empresarial
  const businessUserDesign = await prisma.qrDesign.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Diseño Empresarial',
      foregroundColor: '#1565c0',
      backgroundColor: '#e3f2fd',
      cornerStyle: 'rounded',
      dotStyle: 'rounded',
      logoUrl: 'https://example.com/logo.png',
      logoSize: 25,
      margin: 4,
      errorCorrection: 'H',
      isDefault: false,
      isSystem: false,
      userId: businessUser1.id
    }
  })

  // Crear plantillas de QR
  console.log('Creando plantillas de QR... 📝')

  const basicTemplate = await prisma.qrTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Plantilla Básica',
      description: 'Plantilla estándar para todos los tipos de QR',
      previewUrl: 'https://example.com/templates/basic.png',
      isSystem: true,
      templateData: {
        designId: defaultDesign.id,
        options: {
          showLogo: false,
          showBorder: true
        }
      },
      compatibleTypes: ['URL', 'TEXT', 'VCARD', 'WIFI', 'EMAIL', 'SMS', 'LOCATION'],
      category: 'General',
      isPublic: true,
      isActive: true,
      orderIndex: 1
    }
  })

  const businessTemplate = await prisma.qrTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Plantilla Empresarial',
      description: 'Diseño profesional para uso corporativo',
      previewUrl: 'https://example.com/templates/business.png',
      isSystem: true,
      templateData: {
        designId: blueDesign.id,
        options: {
          showLogo: true,
          logoPosition: 'center',
          showBorder: true,
          borderColor: '#0056b3',
          borderWidth: 2
        }
      },
      compatibleTypes: ['URL', 'VCARD', 'WIFI'],
      category: 'Negocios',
      isPublic: true,
      isActive: true,
      orderIndex: 2
    }
  })

  const ecoTemplate = await prisma.qrTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Eco-Friendly',
      description: 'Diseño con temática ecológica',
      previewUrl: 'https://example.com/templates/eco.png',
      isSystem: true,
      templateData: {
        designId: greenDesign.id,
        options: {
          showLogo: true,
          logoUrl: 'https://example.com/eco-logo.png',
          showBorder: true,
          borderColor: '#2e7d32',
          borderWidth: 3,
          borderStyle: 'dashed'
        }
      },
      compatibleTypes: ['URL', 'LOCATION'],
      category: 'Especial',
      isPublic: true,
      isActive: true,
      orderIndex: 3
    }
  })

  // Plantilla personalizada para el usuario empresarial
  const customBusinessTemplate = await prisma.qrTemplate.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Mi Plantilla Corporativa',
      description: 'Plantilla personalizada para Tecnología Innovadora S.A.',
      previewUrl: 'https://example.com/templates/custom-business.png',
      isSystem: false,
      templateData: {
        designId: businessUserDesign.id,
        options: {
          showLogo: true,
          logoUrl: 'https://example.com/tech-logo.png',
          showBorder: true,
          borderColor: '#1565c0',
          borderWidth: 2
        }
      },
      compatibleTypes: ['URL', 'VCARD', 'WIFI'],
      category: 'Personalizado',
      isPublic: false,
      isActive: true,
      orderIndex: 1,
      userId: businessUser1.id
    }
  })

  // Crear planes básicos
  await prisma.plan.upsert({
    where: { code: 'FREE' },
    update: {},
    create: {
      code: 'FREE',
      name: 'Gratuito',
      description: 'Plan básico gratuito con funcionalidades limitadas',
      features: ['5 QRs estáticos', 'Estadísticas básicas', 'Sin marca de agua'],
      monthlyPrice: 0,
      annualPrice: 0,
      qrLimit: 5,
      dynamicQrEnabled: false,
      analyticsEnabled: true,
      isActive: true,
      orderIndex: 1
    }
  })

  await prisma.plan.upsert({
    where: { code: 'PREMIUM' },
    update: {},
    create: {
      code: 'PREMIUM',
      name: 'Premium',
      description: 'Plan avanzado para uso profesional',
      features: ['QRs ilimitados', 'QRs dinámicos', 'Estadísticas avanzadas', 'Diseños personalizados'],
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      trialDays: 14,
      dynamicQrEnabled: true,
      analyticsEnabled: true,
      customDesignsEnabled: true,
      isActive: true,
      orderIndex: 2
    }
  })

  await prisma.plan.upsert({
    where: { code: 'BUSINESS' },
    update: {},
    create: {
      code: 'BUSINESS',
      name: 'Empresarial',
      description: 'Plan completo para empresas',
      features: ['Todo lo de Premium', 'API de integración', 'Dominios personalizados', 'Soporte prioritario'],
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      dynamicQrEnabled: true,
      analyticsEnabled: true,
      customDesignsEnabled: true,
      apiAccessEnabled: true,
      customDomainsEnabled: true,
      bulkOperationsEnabled: true,
      isActive: true,
      orderIndex: 3
    }
  })

  // Crear promociones
  console.log('Creando promociones... 🏷️')

  const summerPromo = await prisma.promotion.upsert({
    where: { code: 'SUMMER2023' },
    update: {},
    create: {
      code: 'SUMMER2023',
      description: 'Promoción de verano 2023 - 25% de descuento',
      discountType: 'PERCENTAGE',
      discountValue: 25.00,
      maxUses: 100,
      usedCount: 45,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-08-31'),
      isActive: true
    }
  })

  const newUserPromo = await prisma.promotion.upsert({
    where: { code: 'NEWUSER' },
    update: {},
    create: {
      code: 'NEWUSER',
      description: 'Promoción para nuevos usuarios - 10€ de descuento',
      discountType: 'FIXED_AMOUNT',
      discountValue: 10.00,
      maxUses: null, // Ilimitado
      usedCount: 278,
      startDate: new Date('2023-01-01'),
      endDate: null, // Sin fecha de fin
      isActive: true
    }
  })

  const blackFridayPromo = await prisma.promotion.upsert({
    where: { code: 'BLACKFRIDAY' },
    update: {},
    create: {
      code: 'BLACKFRIDAY',
      description: 'Promoción Black Friday - 50% de descuento',
      discountType: 'PERCENTAGE',
      discountValue: 50.00,
      maxUses: 200,
      usedCount: 0,
      startDate: new Date('2023-11-24'),
      endDate: new Date('2023-11-27'),
      isActive: false // Aún no está activa
    }
  })

  // Asociar promociones con planes
  await prisma.planPromotion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      planId: (await prisma.plan.findUnique({ where: { code: 'PREMIUM' } }))!.id,
      promotionId: summerPromo.id
    }
  })

  await prisma.planPromotion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      planId: (await prisma.plan.findUnique({ where: { code: 'BUSINESS' } }))!.id,
      promotionId: summerPromo.id
    }
  })

  await prisma.planPromotion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      planId: (await prisma.plan.findUnique({ where: { code: 'PREMIUM' } }))!.id,
      promotionId: newUserPromo.id
    }
  })

  await prisma.planPromotion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      planId: (await prisma.plan.findUnique({ where: { code: 'PREMIUM' } }))!.id,
      promotionId: blackFridayPromo.id
    }
  })

  await prisma.planPromotion.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      planId: (await prisma.plan.findUnique({ where: { code: 'BUSINESS' } }))!.id,
      promotionId: blackFridayPromo.id
    }
  })

  // Obtener los planes
  const freePlan = await prisma.plan.findUnique({ where: { code: 'FREE' } })
  const premiumPlan = await prisma.plan.findUnique({ where: { code: 'PREMIUM' } })
  const businessPlan = await prisma.plan.findUnique({ where: { code: 'BUSINESS' } })

  if (!freePlan || !premiumPlan || !businessPlan) {
    throw new Error('No se pudieron encontrar los planes')
  }

  // Crear suscripciones para los usuarios
  console.log('Creando suscripciones... 💳')

  // Usuario personal 1 con plan gratuito
  await prisma.subscription.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACTIVE',
      startDate: new Date('2023-01-01'),
      isAutoRenew: false,
      currentPeriodStart: new Date('2023-01-01'),
      currentPeriodEnd: new Date('2099-12-31'), // Prácticamente indefinido para plan gratuito
      qrUsage: 3,
      scanUsage: 120,
      userId: personalUser1.id,
      planId: freePlan.id
    }
  })

  // Usuario personal 2 con plan premium
  const personalUser2Sub = await prisma.subscription.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      status: 'ACTIVE',
      startDate: new Date('2023-06-15'),
      isAutoRenew: true,
      currentPeriodStart: new Date('2023-06-15'),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Un mes desde hoy
      qrUsage: 15,
      scanUsage: 587,
      userId: personalUser2.id,
      planId: premiumPlan.id,
      paymentProvider: 'stripe',
      paymentProviderId: 'sub_mock12345'
    }
  })

  // Usuario empresarial con plan de negocio
  const businessUserSub = await prisma.subscription.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      status: 'ACTIVE',
      startDate: new Date('2023-03-10'),
      endDate: new Date('2024-03-10'),
      isAutoRenew: true,
      currentPeriodStart: new Date('2023-03-10'),
      currentPeriodEnd: new Date('2024-03-10'),
      qrUsage: 78,
      scanUsage: 3452,
      metadata: { customDomain: 'qr.empresainnovadora.com' },
      userId: businessUser1.id,
      planId: businessPlan.id,
      paymentProvider: 'stripe',
      paymentProviderId: 'sub_business987'
    }
  })

  // Usuario institucional con plan premium pero con facturación anual
  const institutionUserSub = await prisma.subscription.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      status: 'ACTIVE',
      startDate: new Date('2023-05-01'),
      endDate: new Date('2024-05-01'),
      isAutoRenew: true,
      currentPeriodStart: new Date('2023-05-01'),
      currentPeriodEnd: new Date('2024-05-01'),
      qrUsage: 45,
      scanUsage: 2167,
      userId: institutionUser.id,
      planId: premiumPlan.id,
      paymentProvider: 'paypal',
      paymentProviderId: 'sub_institution456'
    }
  })

  // Generar facturas para los usuarios con suscripciones de pago
  console.log('Generando facturas... 🧾')

  // Factura para usuario personal 2 (Plan Premium)
  await prisma.invoice.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      invoiceNumber: 'INV-2023-001',
      amount: 19.99,
      tax: 3.80,
      total: 23.79,
      currency: 'USD',
      status: 'PAID',
      dueDate: new Date('2023-06-22'),
      paidAt: new Date('2023-06-20'),
      billingName: 'María González',
      billingEmail: 'usuario2@ejemplo.com',
      paymentMethod: 'credit_card',
      paymentProviderId: 'ch_mock12345',
      subscriptionId: personalUser2Sub.id,
      userId: personalUser2.id
    }
  })

  // Factura para usuario empresarial (Plan Business)
  await prisma.invoice.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      invoiceNumber: 'INV-2023-002',
      amount: 499.99,
      tax: 95.00,
      total: 594.99,
      currency: 'USD',
      status: 'PAID',
      dueDate: new Date('2023-03-15'),
      paidAt: new Date('2023-03-14'),
      billingName: 'Tecnología Innovadora S.A.',
      billingEmail: 'facturacion@empresa1.com',
      billingAddress: 'Calle Principal 123',
      billingCity: 'Bogotá',
      billingCountry: 'Colombia',
      billingPostalCode: '110111',
      paymentMethod: 'bank_transfer',
      paymentProviderId: 'ch_business987',
      subscriptionId: businessUserSub.id,
      userId: businessUser1.id
    }
  })

  // Factura para institución educativa (Plan Premium anual)
  await prisma.invoice.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      invoiceNumber: 'INV-2023-003',
      amount: 199.99,
      tax: 38.00,
      total: 237.99,
      currency: 'USD',
      status: 'PAID',
      dueDate: new Date('2023-05-05'),
      paidAt: new Date('2023-05-05'),
      billingName: 'Universidad Nacional',
      billingEmail: 'pagos@universidad.edu',
      billingAddress: 'Avenida Universidad 45',
      billingCity: 'Bogotá',
      billingCountry: 'Colombia',
      billingPostalCode: '110231',
      paymentMethod: 'paypal',
      paymentProviderId: 'ch_institution456',
      subscriptionId: institutionUserSub.id,
      userId: institutionUser.id
    }
  })

  // Obtener tipos de QR para usarlos
  const urlQrType = await prisma.qrType.findUnique({ where: { code: 'URL' } })
  const vcardQrType = await prisma.qrType.findUnique({ where: { code: 'VCARD' } })
  const wifiQrType = await prisma.qrType.findUnique({ where: { code: 'WIFI' } })
  const textQrType = await prisma.qrType.findUnique({ where: { code: 'TEXT' } })
  
  if (!urlQrType || !vcardQrType || !wifiQrType || !textQrType) {
    throw new Error('No se pudieron encontrar los tipos de QR')
  }

  // Crear códigos QR
  console.log('Creando códigos QR... 📱')

  // QR estático de URL para usuario personal 1
  const personalUserQr1 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Mi Sitio Web Personal',
      shortId: 'abc123',
      description: 'QR para mi blog personal',
      isActive: true,
      isStatic: true,
      qrImageUrl: 'https://storage.example.com/qr/abc123.png',
      scanCount: 45,
      lastScanAt: new Date('2023-07-15'),
      userId: personalUser1.id,
      qrTypeId: urlQrType.id,
      designId: defaultDesign.id,
      content: {
        create: {
          content: {
            url: 'https://miblog.ejemplo.com'
          }
        }
      }
    }
  })

  // QR de texto para usuario personal 1
  const personalUserQr2 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Datos de mi curso',
      shortId: 'def456',
      description: 'Horario y aula del curso',
      isActive: true,
      isStatic: true,
      qrImageUrl: 'https://storage.example.com/qr/def456.png',
      scanCount: 27,
      lastScanAt: new Date('2023-07-10'),
      userId: personalUser1.id,
      qrTypeId: textQrType.id,
      designId: defaultDesign.id,
      content: {
        create: {
          content: {
            text: 'Curso de Desarrollo Web: Lunes y Miércoles 18:00-20:00, Aula 302'
          }
        }
      }
    }
  })

  // QR para usuario personal 2 (premium)
  const personalUser2Qr1 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Mi Perfil Profesional',
      shortId: 'ghi789',
      description: 'Enlace a mi perfil de LinkedIn',
      isActive: true,
      isStatic: false,
      dynamicUrl: 'https://qryptogenia.com/r/ghi789',
      qrImageUrl: 'https://storage.example.com/qr/ghi789.png',
      scanCount: 134,
      lastScanAt: new Date(),
      userId: personalUser2.id,
      qrTypeId: urlQrType.id,
      designId: purpleDesign.id,
      templateId: basicTemplate.id,
      content: {
        create: {
          content: {
            url: 'https://linkedin.com/in/mariagonzalez'
          }
        }
      }
    }
  })

  // QR de tarjeta de contacto para usuario personal 2
  const personalUser2Qr2 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Mi Tarjeta de Contacto',
      shortId: 'jkl012',
      description: 'Datos de contacto profesional',
      isActive: true,
      isStatic: true,
      qrImageUrl: 'https://storage.example.com/qr/jkl012.png',
      scanCount: 67,
      lastScanAt: new Date('2023-07-20'),
      userId: personalUser2.id,
      qrTypeId: vcardQrType.id,
      designId: purpleDesign.id,
      content: {
        create: {
          content: {
            name: 'María González',
            phone: '+573219876543',
            email: 'contacto@mariagonzalez.com',
            title: 'Diseñadora UX/UI',
            organization: 'Freelance'
          }
        }
      }
    }
  })

  // QR para usuario empresarial
  const businessUserQr1 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Sitio Web Corporativo',
      shortId: 'mno345',
      description: 'QR para el sitio web principal de la empresa',
      isActive: true,
      isStatic: false,
      dynamicUrl: 'https://qryptogenia.com/r/mno345',
      qrImageUrl: 'https://storage.example.com/qr/mno345.png',
      scanCount: 1256,
      lastScanAt: new Date(),
      userId: businessUser1.id,
      qrTypeId: urlQrType.id,
      designId: businessUserDesign.id,
      templateId: customBusinessTemplate.id,
      content: {
        create: {
          content: {
            url: 'https://tecnologiainnovadora.com'
          }
        }
      }
    }
  })

  // QR WiFi para la oficina
  const businessUserQr2 = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'WiFi Oficina',
      shortId: 'pqr678',
      description: 'Acceso a la red WiFi de la oficina para visitantes',
      isActive: true,
      isStatic: true,
      qrImageUrl: 'https://storage.example.com/qr/pqr678.png',
      scanCount: 328,
      lastScanAt: new Date('2023-07-25'),
      userId: businessUser1.id,
      qrTypeId: wifiQrType.id,
      designId: businessUserDesign.id,
      templateId: businessTemplate.id,
      content: {
        create: {
          content: {
            ssid: 'Tecnologia_Innovadora_Guest',
            password: 'Wifi2023Guest!',
            encryption: 'WPA'
          }
        }
      }
    }
  })

  // QR para institución educativa
  const institutionQr = await prisma.qrCode.upsert({
    where: { id: '00000000-0000-0000-0000-000000000007' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000007',
      name: 'Campus Virtual',
      shortId: 'stu901',
      description: 'QR para acceder al campus virtual de la universidad',
      isActive: true,
      isStatic: false,
      dynamicUrl: 'https://qryptogenia.com/r/stu901',
      qrImageUrl: 'https://storage.example.com/qr/stu901.png',
      scanCount: 4562,
      lastScanAt: new Date(),
      userId: institutionUser.id,
      qrTypeId: urlQrType.id,
      designId: greenDesign.id,
      templateId: ecoTemplate.id,
      content: {
        create: {
          content: {
            url: 'https://campus.universidad.edu'
          }
        }
      }
    }
  })

  // Crear registros de escaneos
  console.log('Registrando escaneos de QR... 📊')

  // Función para crear escaneos ficticios en un rango de fechas
  const createFakeScans = async (qrId: string, count: number, dateRange: number = 30) => {
    const devices = ['mobile', 'desktop', 'tablet']
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
    const operatingSystems = ['Android', 'iOS', 'Windows', 'macOS']
    const countries = ['CO', 'MX', 'ES', 'AR', 'PE', 'CL', 'US']
    const cities = ['Bogotá', 'Medellín', 'Ciudad de México', 'Madrid', 'Buenos Aires', 'Lima', 'Santiago', 'Miami']
    
    // Función para generar UUID v4 válidos
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    
    // Definir el tipo correcto para el array de escaneos
    type QrScan = {
      id: string;
      qrCodeId: string;
      ipAddress: string;
      userAgent: string;
      deviceType: string;
      operatingSystem: string;
      browser: string;
      country: string;
      city: string;
      createdAt: Date;
    }
    
    const scans: QrScan[] = []
    
    // Generar registros de escaneos
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * dateRange)
      const scanDate = new Date()
      scanDate.setDate(scanDate.getDate() - daysAgo)
      scanDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60))
      
      const deviceType = devices[Math.floor(Math.random() * devices.length)]
      const browser = browsers[Math.floor(Math.random() * browsers.length)]
      const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)]
      const country = countries[Math.floor(Math.random() * countries.length)]
      const city = cities[Math.floor(Math.random() * cities.length)]
      
      scans.push({
        id: generateUUID(),
        qrCodeId: qrId,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: `Mozilla/5.0 (compatible; Example Bot ${Math.floor(Math.random() * 100)})`,
        deviceType,
        operatingSystem: os,
        browser,
        country,
        city,
        createdAt: scanDate
      })
    }
    
    // Insertar registros en lotes
    for (const scan of scans) {
      await prisma.qrScan.upsert({
        where: { id: scan.id },
        update: {},
        create: scan
      })
    }
  }

  // Crear algunos escaneos para los QRs
  await createFakeScans(personalUserQr1.id, 45, 60)
  await createFakeScans(personalUserQr2.id, 27, 45)
  await createFakeScans(personalUser2Qr1.id, 134, 90)
  await createFakeScans(personalUser2Qr2.id, 67, 30)
  await createFakeScans(businessUserQr1.id, 200, 180) // Solo una muestra de los 1256 totales
  await createFakeScans(businessUserQr2.id, 100, 90)  // Solo una muestra de los 328 totales
  await createFakeScans(institutionQr.id, 300, 120)   // Solo una muestra de los 4562 totales

  // Crear analíticas agregadas para QRs más usados
  console.log('Generando analíticas de QR... 📈')

  // Generar analíticas para el QR empresarial
  await prisma.qrAnalytics.upsert({
    where: { qrCodeId: businessUserQr1.id },
    update: {},
    create: {
      qrCodeId: businessUserQr1.id,
      totalScans: 1256,
      dailyScans: {
        '2023-07-25': 32,
        '2023-07-26': 45,
        '2023-07-27': 38,
        '2023-07-28': 41,
        '2023-07-29': 29,
        '2023-07-30': 18,
        '2023-07-31': 22
      },
      weeklyScans: {
        '2023-W29': 245,
        '2023-W30': 278,
        '2023-W31': 302
      },
      monthlyScans: {
        '2023-05': 358,
        '2023-06': 402,
        '2023-07': 496
      },
      deviceBreakdown: {
        mobile: 856,
        desktop: 324,
        tablet: 76
      },
      browserBreakdown: {
        Chrome: 645,
        Safari: 298,
        Firefox: 187,
        Edge: 126
      },
      countryBreakdown: {
        CO: 723,
        MX: 215,
        ES: 143,
        US: 85,
        OTHER: 90
      }
    }
  })

  // Generar analíticas para el QR institucional
  await prisma.qrAnalytics.upsert({
    where: { qrCodeId: institutionQr.id },
    update: {},
    create: {
      qrCodeId: institutionQr.id,
      totalScans: 4562,
      dailyScans: {
        '2023-07-25': 132,
        '2023-07-26': 145,
        '2023-07-27': 138,
        '2023-07-28': 141,
        '2023-07-29': 129,
        '2023-07-30': 118,
        '2023-07-31': 122
      },
      weeklyScans: {
        '2023-W29': 845,
        '2023-W30': 978,
        '2023-W31': 1102
      },
      monthlyScans: {
        '2023-05': 1258,
        '2023-06': 1402,
        '2023-07': 1902
      },
      deviceBreakdown: {
        mobile: 3156,
        desktop: 1124,
        tablet: 282
      },
      browserBreakdown: {
        Chrome: 2345,
        Safari: 1298,
        Firefox: 687,
        Edge: 232
      },
      countryBreakdown: {
        CO: 4023,
        MX: 215,
        ES: 143,
        US: 85,
        OTHER: 96
      }
    }
  })

  console.log('Seeds creados exitosamente... 😎👍👌')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

