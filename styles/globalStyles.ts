import { createGlobalStyle } from "styled-components";
import { devices } from "lib/displayDevice";

export const GlobalStyle = createGlobalStyle`
    body {
      margin:0;
      padding:0;
      border: 0;
      outline: 0;
      overflow-x: hidden;
      font-family: 'Red Hat Display', Roboto, Arial, sans-serif;
    }

    * {
      box-sizing: border-box;
      border: 0 solid;
    }

    html {
        scroll-behavior: smooth;

    }

    #__next {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    a {
      text-decoration: none;
      text-align: initial;
      outline: none;
      font-size: 1.250rem;
    }

    button {
      padding: 0;
      line-height: inherit;
      color: inherit;
      cursor: pointer;
    }

    input,
    textarea {
      border: 0;
      transition: all 0.3s ease-in-out;  
      outline: none;
      width: 100%;  
      padding: 1rem 1.25rem;
    }

    h2, h3, h4, h5 {
      line-height: 35px;
    }

    h1 {
      font-weight: 600;
      letter-spacing: 0.025rem;
      margin-bottom: 1rem;
      font-size: 2.8125rem;
      
      @media ${devices.tabletL} {
        font-size: 2.375rem;      
      }

      @media ${devices.mobileL} {
        font-size: 1.75rem;      
      }
    }

    h3 {
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 2rem;   

      @media ${devices.tabletL} {
        font-size: 1.75rem;      
      }

      @media ${devices.mobileL} {
        font-size: 1.25rem;      
      }
    }

    h4 {
      margin-bottom: 1rem;
      font-weight: 600;
      font-size: 1.25rem;      
    }

    p, li {
      line-height: 28px;
    }

    p, h2, button {
      font-weight: 400;
      font-size: 1.250rem;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
`;
