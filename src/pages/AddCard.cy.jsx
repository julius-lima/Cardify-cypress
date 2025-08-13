import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})

Cypress.Commands.add('fillCardForm', (card) => {
  cy.get('[data-cy="number"]').type(card.number)
  cy.get('[data-cy="holderName"]').type(card.holderName)
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate)
  cy.get('[data-cy="cvv"]').type(card.cvv)
  cy.get(`[data-cy="bank-${card.bank}"]`).click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click()
})

describe('<AddCard />', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })

  it('exibe erros quando campos não são informados', () => {

    cy.contains('button', 'Adicionar Cartão').click()

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })
  })

  it('deve cadastrar um novo cartão de credito ', () => {

    const myCard = {
      number: '4242424242424242',
      holderName: 'Julio Lima',
      expirationDate: '12/30',
      cvv: '123',
      bank: 'neon'
    }

    cy.fillCardForm(myCard)

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (req) => {
      req.reply({
        statusCode: 201,
        body: myCard
      })
    }).as('addCard')

    cy.submitCardForm()

    cy.wait('@addCard')

    cy.get('.notice-sucess')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso!')


  })

  it('valida nome do titular com ,enos de caracteres ', () => {

    const myCard = {
      number: '4242424242424242',
      holderName: 'J',
      expirationDate: '12/30',
      cvv: '123',
      bank: 'neon'
    }

    cy.fillCardForm(myCard)
    cy.submitCardForm()

    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')
  })

  it('valida data de expiração inválida ', () => {

    const myCard = {
      number: '4242424242424242',
      holderName: 'Julio Lima',
      expirationDate: '13/30',
      cvv: '123',
      bank: 'neon'
    }

    cy.fillCardForm(myCard)
    cy.submitCardForm()

    cy.alertErrorHaveText('Data de expiração inválida ou vencida')
  })

  it('valida CVV com menos de 3 digitos ', () => {

    const myCard = {
      number: '4242424242424242',
      holderName: 'Julio Lima',
      expirationDate: '12/30',
      cvv: '12',
      bank: 'neon'
    }

    cy.fillCardForm(myCard)
    cy.submitCardForm()

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')
  })

})

// Para iniciar o Cypress, use o comando:
// npx cypress open
// para iniciar a aplicação, use o comando:
// npm run dev