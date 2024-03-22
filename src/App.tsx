import {
  ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

function App() {
  return (
    <>
      <h2>Direct Wallet Button</h2>

      <MetamaskButton />
      <CoinbaseButton />

      <h2>Encapsulated Wallet Button</h2>

      <ConnectButton fallbackContent={<div>Themed Welcome UI</div>}>
        <MetamaskButton />
        <CoinbaseButton />
      </ConnectButton>
    </>
  );
}

export default App;

type CTX = {
  appendChild: (el: ReactNode) => void;
  removeChild: (el: ReactNode) => void;
  setActiveContent: (el: ReactNode) => void;
} | null;

const context = createContext<CTX>(null);

const ConnectButton = ({
  children,
  fallbackContent,
}: React.PropsWithChildren<{ fallbackContent?: ReactNode }>) => {
  const [activeContent, setActiveContent] = useState<ReactNode | null>(null);
  const [buttons, setButtons] = useState<ReactNode[]>([]);

  function appendChild(el: ReactNode) {
    setButtons((buttons) => [...buttons, el]);
  }
  function removeChild(el: ReactNode) {
    setButtons((buttons) => buttons.filter((b) => b !== el));
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen((o) => !o)}>Connect Wallet</button>
      {isOpen && (
        <div className="modal">
          <context.Provider
            value={{ appendChild, removeChild, setActiveContent }}
          >
            {children}
          </context.Provider>
          <ul>
            {buttons.map((b, idx) => (
              <li key={`b_${idx}`}>{b}</li>
            ))}
          </ul>
          {activeContent || fallbackContent}
        </div>
      )}
    </>
  );
};

const ButtonPortal = (props: React.PropsWithChildren) => {
  const ctx = useContext(context);

  useLayoutEffect(() => {
    if (!ctx) {
      // do nothing
    }
    ctx?.appendChild(props.children);
    return () => {
      ctx?.removeChild(props.children);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ctx) {
    return props.children;
  }
  // if we have ctx we actually *don't* want to render here!
  return null;
};

const ContentPortal = (props: React.PropsWithChildren) => {
  const ctx = useContext(context);

  useLayoutEffect(() => {
    if (!ctx) {
      // do nothing
    }
    ctx?.setActiveContent(props.children);
    return () => {
      ctx?.setActiveContent(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.children]);

  if (!ctx) {
    return props.children;
  }
  // if we have ctx we actually *don't* want to render here!
  return null;
};

const MetamaskButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <ButtonPortal>
        <button onClick={() => setModalOpen((open) => !open)}>MetaMask</button>
      </ButtonPortal>
      <ContentPortal>
        {modalOpen && <div className="modal">Metamask Connect UI</div>}
      </ContentPortal>
    </>
  );
};

const CoinbaseButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <ButtonPortal>
        <button onClick={() => setModalOpen((open) => !open)}>Coinbase</button>
      </ButtonPortal>
      <ContentPortal>
        {modalOpen && <div className="modal">Coinbase Connect UI</div>}
      </ContentPortal>
    </>
  );
};
