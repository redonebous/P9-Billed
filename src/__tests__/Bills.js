/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"


import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const container = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      document.body.innerHTML = BillsUI({ data: bills })

    })

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getAllByTestId('icon-window'))
      const windowIcons = screen.getAllByTestId('icon-window')
      expect(windowIcons[0].classList.contains('active-icon')).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    test("Then bills are formated with getBills", async () => {
      const container = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const getBills = jest.fn(() => container.getBills())
      const data = await getBills()
      expect(data).toBeTruthy()
      expect(data[0].id).toEqual(bills[0].id)
    })

    describe("When I click on eye icon or close icon", () => {
      test("Then modal file appear", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const container = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        document.body.innerHTML = BillsUI({ data: bills })
        const eyesIcon = screen.getAllByTestId('icon-eye')
        $.fn.modal = jest.fn()
        const handleClickIconEye = jest.fn((eyesIcon) => container.handleClickIconEye(eyesIcon))

        eyesIcon.forEach((icon) => {
          icon.addEventListener("click", handleClickIconEye(icon))
          userEvent.click(icon)
        })
        expect(handleClickIconEye).toHaveBeenCalled()


        await waitFor(() => document.getElementById('modaleFile'))
        const modal = screen.getByText('Justificatif')
        expect(modal).toBeTruthy()
      })

    })

    describe("When I click on NewBill button", () => {
      test("Then location change to NewBill's page", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        document.body.innerHTML = BillsUI({ data: bills })

        const container = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage })


        const handleClickNewBill = jest.fn(() => container.handleClickNewBill())

        const newBillBtn = screen.getByTestId('btn-new-bill')

        newBillBtn.addEventListener("click", handleClickNewBill())
        userEvent.click(newBillBtn)
        const newBillPage = screen.getByTestId('form-new-bill')
        expect(newBillPage).toBeTruthy()
      })

    })

    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const tbody = screen.getByTestId('tbody')
      expect(tbody.childElementCount).toBeGreaterThan(0)
    })


    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()



      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByTestId('error-message')
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByTestId('error-message')
        expect(message).toBeTruthy()
      })
    })
  })
})
