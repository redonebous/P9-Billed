/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js"
import userEvent from "@testing-library/user-event"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))

    })

    test('Then i change the file with jpg', async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const container = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      const handleChangeFile = jest.fn(() => container.handleChangeFile)

      const input = screen.getByTestId('file')
      input.addEventListener('change', handleChangeFile)

      const file = new File(['test'], 'file.jpg')

      await waitFor(() => userEvent.upload(input, file))


      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0]).toStrictEqual(file)
      expect(container.fileName).toBe(file.name)

    })

    test('Then i change the file with pdf', async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const container = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })

      const handleChangeFile = jest.fn(() => container.handleChangeFile)

      const input = screen.getByTestId('file')
      input.addEventListener('change', handleChangeFile)

      const file = new File(['test'], 'file.pdf')

      await waitFor(() => userEvent.upload(input, file))


      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0]).toStrictEqual(file)
      expect(container.fileName).toBe(null)

    })

    test("Then i submit form", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const container = new NewBill({ document, onNavigate, store: mockStore, localStorage: localStorageMock })


      const handleSubmit = jest.fn(() => container.handleSubmit)
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      form.dispatchEvent(new Event('submit'))
      expect(handleSubmit).toHaveBeenCalled()

      const billPage = screen.getByTestId('tbody')
      expect(billPage).toBeTruthy()

    })
  })
})
